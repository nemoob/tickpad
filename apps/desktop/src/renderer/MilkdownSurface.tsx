import { LanguageDescription, LanguageSupport, StreamLanguage } from "@codemirror/language";
import { languages as codeMirrorLanguages } from "@codemirror/language-data";
import { Crepe, CrepeFeature } from "@milkdown/crepe";
import { useEffect, useLayoutEffect, useRef } from "react";

import { copySelectedText, copySelectionIcon } from "./editor-clipboard";
import { renderMermaidCodeBlocks } from "./mermaid-support";
import type { SelectionToolbarToolId } from "./preferences";

const mermaidLanguageSupport = new LanguageSupport(
  StreamLanguage.define({
    name: "mermaid",
    token: (stream) => {
      stream.skipToEnd();
      return null;
    }
  })
);

const codeBlockLanguages = [
  LanguageDescription.of({
    name: "Mermaid",
    alias: ["mermaid", "mmd"],
    extensions: ["mmd", "mermaid"],
    support: mermaidLanguageSupport
  }),
  ...codeMirrorLanguages
];

type MilkdownSurfaceProps = {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder: string;
  toolbarTools: SelectionToolbarToolId[];
};

export function MilkdownSurface({ markdown, onChange, placeholder, toolbarTools }: MilkdownSurfaceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const toolbarToolsKey = toolbarTools.join("|");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useLayoutEffect(() => {
    if (!rootRef.current) {
      return;
    }

    let disposed = false;
    let renderTimer = 0;
    const queueMermaidRender = () => {
      window.clearTimeout(renderTimer);
      renderTimer = window.setTimeout(() => {
        if (!disposed && rootRef.current) {
          void renderMermaidCodeBlocks(rootRef.current);
        }
      }, 80);
    };

    const enabledToolbarTools = new Set(toolbarTools);
    const crepe = new Crepe({
      root: rootRef.current,
      defaultValue: markdown,
      featureConfigs: {
        [CrepeFeature.CodeMirror]: {
          languages: codeBlockLanguages
        },
        [CrepeFeature.Placeholder]: {
          text: placeholder
        },
        [CrepeFeature.Toolbar]: {
          buildToolbar: (builder) => {
            const formattingGroup = builder.getGroup("formatting");
            formattingGroup.group.items = formattingGroup.group.items.filter((item) => enabledToolbarTools.has(item.key as SelectionToolbarToolId));

            const functionGroup = builder.getGroup("function");
            functionGroup.group.items = functionGroup.group.items.filter((item) => enabledToolbarTools.has(item.key as SelectionToolbarToolId));
            if (enabledToolbarTools.has("copy")) {
              functionGroup.addItem("copy", {
                icon: copySelectionIcon,
                active: () => false,
                onRun: copySelectedText
              });
            }
          }
        }
      }
    });

    crepe.on((listener) => {
      listener.markdownUpdated((_, nextMarkdown) => {
        onChangeRef.current(nextMarkdown);
        queueMermaidRender();
      });
    });

    const observer = new MutationObserver(queueMermaidRender);
    observer.observe(rootRef.current, { childList: true, subtree: true, characterData: true });

    void crepe.create().then(queueMermaidRender);
    return () => {
      disposed = true;
      window.clearTimeout(renderTimer);
      observer.disconnect();
      void crepe.destroy();
    };
  }, [toolbarToolsKey, placeholder]);

  return <div ref={rootRef} className="milkdown-host" data-testid="wysiwyg-editor" />;
}
