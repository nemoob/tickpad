export const copySelectionIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2" />
    <path d="M5 15V7a2 2 0 0 1 2-2h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
`;

export function copySelectedText() {
  const text = window.getSelection()?.toString() ?? "";
  if (text) {
    void navigator.clipboard.writeText(text);
  }
}

export async function writeClipboardHtml(html: string) {
  if (typeof ClipboardItem !== "undefined" && typeof navigator.clipboard.write === "function") {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([html], { type: "text/plain" })
      })
    ]);
    return;
  }
  await navigator.clipboard.writeText(html);
}
