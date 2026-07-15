import type { TranslationKey } from "./i18n";

export const codeBlockStylePresets = [
  {
    id: "soft",
    labelKey: "codeBlockSoft",
    descriptionKey: "codeBlockSoftDescription"
  },
  {
    id: "editor",
    labelKey: "codeBlockEditor",
    descriptionKey: "codeBlockEditorDescription"
  },
  {
    id: "terminal",
    labelKey: "codeBlockTerminal",
    descriptionKey: "codeBlockTerminalDescription"
  }
] as const satisfies readonly {
  id: string;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
}[];

export type CodeBlockStyleId = (typeof codeBlockStylePresets)[number]["id"];

const codeBlockStyleStorageKey = "tickpad:code-block-style";
const defaultCodeBlockStyle: CodeBlockStyleId = "soft";

export function isCodeBlockStyle(value: string | null): value is CodeBlockStyleId {
  return codeBlockStylePresets.some((preset) => preset.id === value);
}

export function getCodeBlockStyle() {
  const style = localStorage.getItem(codeBlockStyleStorageKey);
  return isCodeBlockStyle(style) ? style : defaultCodeBlockStyle;
}

export function applyCodeBlockStyle(style: CodeBlockStyleId) {
  const documentElement = window.document.documentElement;
  documentElement.dataset.codeBlockStyle = style;
}

export function setCodeBlockStyle(style: CodeBlockStyleId) {
  localStorage.setItem(codeBlockStyleStorageKey, style);
  applyCodeBlockStyle(style);
}
