export interface MarkdownDocument {
  path?: string;
  title: string;
  markdown: string;
  dirty: boolean;
  updatedAt: number;
}

export interface ProductInfo {
  name: "Tickpad";
  packageName: "tickpad";
  tagline: "A plugin-first Markdown editor";
  preferredDomain: "tickpad.dev";
}

export const productInfo: ProductInfo = {
  name: "Tickpad",
  packageName: "tickpad",
  tagline: "A plugin-first Markdown editor",
  preferredDomain: "tickpad.dev"
};

export function getDocumentTitle(markdown: string, fallback = "Untitled.md"): string {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading ? `${heading}.md` : fallback;
}
