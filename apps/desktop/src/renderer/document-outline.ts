import type { CSSProperties } from "react";

import { clampNumber } from "./preferences";

export type DocumentOutlineItem = {
  id: string;
  index: number;
  level: number;
  text: string;
  targetText: string;
};

const maxDocumentOutlineTextLength = 56;

export function cleanOutlineText(value: string) {
  return value
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/^>\s*/, "")
    .replace(/^[-*+]\s+(?:\[[ xX]\]\s*)?/, "")
    .replace(/^\[[ xX]\]\s*/, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function trimOutlineText(value: string) {
  return value.length > maxDocumentOutlineTextLength ? `${value.slice(0, maxDocumentOutlineTextLength - 1)}...` : value;
}

export function getOutlineTextStyle(level: number) {
  const normalizedLevel = clampNumber(level, 1, 6);
  return {
    "--outline-heading-size": `${Math.max(12, 18 - normalizedLevel)}px`
  } as CSSProperties;
}

export function buildDocumentOutline(markdown: string): DocumentOutlineItem[] {
  const outline: DocumentOutlineItem[] = [];
  let inFence = false;

  const appendHeading = (item: Omit<DocumentOutlineItem, "id" | "index" | "text">) => {
    if (!item.targetText) {
      return;
    }
    const index = outline.length;
    outline.push({
      ...item,
      index,
      id: `heading:${index}:${item.targetText}`,
      text: trimOutlineText(item.targetText)
    });
  };

  for (const line of markdown.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (/^(```|~~~)/.test(trimmed)) {
      inFence = !inFence;
      continue;
    }
    if (inFence || !trimmed) {
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      appendHeading({
        level: headingMatch[1].length,
        targetText: cleanOutlineText(headingMatch[2])
      });
    }
  }

  return outline;
}
