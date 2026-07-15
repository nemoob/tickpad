import mermaid from "mermaid";

let initialized = false;
let registeredGlobalClose = false;
let renderIndex = 0;
const mermaidBlockClass = "mermaid-code-block";
const mermaidSourceVisibleClass = "mermaid-source-visible";

const initializeMermaid = () => {
  if (initialized) {
    return;
  }
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "default"
  });
  initialized = true;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const getBlockLanguage = (block: Element) => {
  const languageButton = block.querySelector(".language-button");
  const directText = languageButton?.childNodes[0]?.textContent?.trim();
  if (directText) {
    return directText.toLowerCase();
  }
  return block.querySelector(".cm-content")?.getAttribute("data-language")?.toLowerCase() ?? "";
};

const getBlockSource = (block: Element) =>
  [...block.querySelectorAll(".cm-line")]
    .map((line) => line.textContent ?? "")
    .join("\n")
    .trim();

const getPreview = (block: Element) => block.querySelector<HTMLElement>(":scope > .mermaid-preview");

const hideOtherMermaidSources = (currentBlock: Element) => {
  document.querySelectorAll(`.${mermaidBlockClass}.${mermaidSourceVisibleClass}`).forEach((block) => {
    if (block !== currentBlock) {
      block.classList.remove(mermaidSourceVisibleClass);
    }
  });
};

const showMermaidSource = (block: Element) => {
  hideOtherMermaidSources(block);
  block.classList.add(mermaidSourceVisibleClass);
};

const registerGlobalClose = () => {
  if (registeredGlobalClose) {
    return;
  }
  window.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    document.querySelectorAll(`.${mermaidBlockClass}.${mermaidSourceVisibleClass}`).forEach((block) => {
      if (!block.contains(target)) {
        block.classList.remove(mermaidSourceVisibleClass);
      }
    });
  });
  registeredGlobalClose = true;
};

const setupMermaidInteractions = (block: Element, preview: HTMLElement) => {
  registerGlobalClose();
  if (preview.dataset.sourceToggle !== "1") {
    preview.dataset.sourceToggle = "1";
    preview.tabIndex = 0;
    preview.addEventListener("click", () => showMermaidSource(block));
    preview.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showMermaidSource(block);
      }
    });
  }

  const blockElement = block as HTMLElement;
  if (blockElement.dataset.mermaidInteractions === "1") {
    return;
  }
  blockElement.dataset.mermaidInteractions = "1";
  block.addEventListener("focusin", () => showMermaidSource(block));
  block.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (!block.contains(document.activeElement)) {
        block.classList.remove(mermaidSourceVisibleClass);
      }
    });
  });
};

async function renderMermaidBlock(block: Element) {
  const existingPreview = getPreview(block);
  if (getBlockLanguage(block) !== "mermaid") {
    existingPreview?.remove();
    block.classList.remove(mermaidBlockClass, mermaidSourceVisibleClass);
    return;
  }

  const source = getBlockSource(block);
  if (!source) {
    existingPreview?.remove();
    block.classList.remove(mermaidBlockClass, mermaidSourceVisibleClass);
    return;
  }

  block.classList.add(mermaidBlockClass);
  let preview = existingPreview;
  if (!preview) {
    preview = document.createElement("div");
    preview.className = "mermaid-preview";
    block.append(preview);
  }
  setupMermaidInteractions(block, preview);

  if (preview.dataset.source === source && preview.querySelector("svg")) {
    return;
  }

  preview.dataset.source = source;
  preview.innerHTML = '<span class="mermaid-preview-status">Rendering Mermaid...</span>';

  try {
    const result = await mermaid.render(`tickpad-mermaid-${renderIndex++}`, source);
    preview.innerHTML = result.svg;
    result.bindFunctions?.(preview);
  } catch (error) {
    preview.innerHTML = `<pre class="mermaid-preview-error">${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>`;
  }
}

export async function renderMermaidCodeBlocks(root: ParentNode) {
  initializeMermaid();
  for (const block of [...root.querySelectorAll(".milkdown-code-block")]) {
    await renderMermaidBlock(block);
  }
}
