import { defaultConfig } from "@tickpad/config";

import type { TranslationKey } from "./i18n";

export const themePresets = [
  { id: "light", labelKey: "defaultLightTheme", tone: "light" },
  { id: "dark", labelKey: "defaultDarkTheme", tone: "dark" },
  { id: "codex", labelKey: "codexTheme", tone: "codex" },
  { id: "vscode", labelKey: "vscodeTheme", tone: "vscode" },
  { id: "idea", labelKey: "ideaTheme", tone: "idea" }
] as const satisfies readonly { id: string; labelKey: TranslationKey; tone: string }[];
export type AppTheme = (typeof themePresets)[number]["id"];

export const defaultRailWidth = 228;
export const legacyDefaultRailWidth = 208;
export const minRailWidth = 168;
export const maxRailWidth = 360;

export const editorWidthPresets = [
  { id: "small", labelKey: "small", ratio: 75 },
  { id: "medium", labelKey: "medium", ratio: 85 },
  { id: "large", labelKey: "large", ratio: 95 }
] as const;
export type EditorWidthPresetId = (typeof editorWidthPresets)[number]["id"];

const defaultEditorWidthPreset = "medium";
const systemFontStack = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const monoFontStack = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

export const textFontPresets = [
  { id: "system", labelKey: "systemFont", stack: systemFontStack, sample: "Aa" },
  { id: "pingfang", labelKey: "pingfangFont", stack: `"PingFang SC", ${systemFontStack}`, sample: "苹" },
  { id: "songti", labelKey: "songtiFont", stack: `"Songti SC", ${systemFontStack}`, sample: "宋" },
  { id: "kaiti", labelKey: "kaitiFont", stack: `"Kaiti SC", ${systemFontStack}`, sample: "楷" },
  { id: "heiti", labelKey: "heitiFont", stack: `"Heiti SC", ${systemFontStack}`, sample: "黑" },
  { id: "helvetica", labelKey: "helveticaFont", stack: `"Helvetica Neue", ${systemFontStack}`, sample: "Aa" },
  { id: "arial", labelKey: "arialFont", stack: `Arial, ${systemFontStack}`, sample: "Aa" },
  { id: "serif", labelKey: "serifFont", stack: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif', sample: "Aa" },
  { id: "georgia", labelKey: "georgiaFont", stack: `Georgia, ui-serif, serif`, sample: "Aa" },
  { id: "times", labelKey: "timesFont", stack: `"Times New Roman", ui-serif, serif`, sample: "Aa" },
  { id: "mono", labelKey: "monoFont", stack: monoFontStack, sample: "Aa" }
] as const satisfies readonly { id: string; labelKey: TranslationKey; stack: string; sample: string }[];
export type TextFontPresetId = (typeof textFontPresets)[number]["id"];

export const codeFontPresets = [
  { id: "mono", labelKey: "monoFont", stack: monoFontStack, sample: "{}" },
  { id: "sf-mono", labelKey: "sfMonoFont", stack: `"SF Mono", ${monoFontStack}`, sample: "{}" },
  { id: "menlo", labelKey: "menloFont", stack: `Menlo, ${monoFontStack}`, sample: "{}" },
  { id: "monaco", labelKey: "monacoFont", stack: `Monaco, ${monoFontStack}`, sample: "{}" },
  { id: "courier", labelKey: "courierFont", stack: `"Courier New", ${monoFontStack}`, sample: "{}" },
  { id: "compact", labelKey: "compactMonoFont", stack: `"SF Mono", ${monoFontStack}`, sample: "{}" }
] as const satisfies readonly { id: string; labelKey: TranslationKey; stack: string; sample: string }[];
export type CodeFontPresetId = (typeof codeFontPresets)[number]["id"];

export const shellFontPresets = [
  { id: "system", labelKey: "systemFont", stack: systemFontStack, sample: "UI" },
  { id: "sf-pro", labelKey: "sfProFont", stack: `"SF Pro Display", "SF Pro Text", ${systemFontStack}`, sample: "UI" },
  { id: "rounded", labelKey: "roundedFont", stack: `ui-rounded, "SF Pro Rounded", ${systemFontStack}`, sample: "UI" },
  { id: "helvetica", labelKey: "helveticaFont", stack: `"Helvetica Neue", ${systemFontStack}`, sample: "UI" },
  { id: "pingfang", labelKey: "pingfangFont", stack: `"PingFang SC", ${systemFontStack}`, sample: "界" },
  { id: "mono", labelKey: "monoFont", stack: monoFontStack, sample: "UI" }
] as const satisfies readonly { id: string; labelKey: TranslationKey; stack: string; sample: string }[];
export type ShellFontPresetId = (typeof shellFontPresets)[number]["id"];

const defaultTextFontPreset = "system";
const defaultCodeFontPreset = "mono";
const defaultShellFontPreset = "system";
export const defaultEditorFontSize = 16;
export const minEditorFontSize = 14;
export const maxEditorFontSize = 20;
export const defaultCodeFontSize = 14;
export const minCodeFontSize = 12;
export const maxCodeFontSize = 18;
export const defaultSelectionToolbarSize = 26;
export const minSelectionToolbarSize = 22;
export const maxSelectionToolbarSize = 32;
export const selectionToolbarSizeStep = 2;
const defaultMarkdownSymbolMappingEnabled = true;
export const defaultSelectionToolbarTools = ["bold", "italic", "strikethrough", "code", "link", "latex", "copy"] as const;
export type SelectionToolbarToolId = (typeof defaultSelectionToolbarTools)[number];

export const selectionToolbarToolOptions: { id: SelectionToolbarToolId; labelKey: TranslationKey }[] = [
  { id: "bold", labelKey: "bold" },
  { id: "italic", labelKey: "italic" },
  { id: "strikethrough", labelKey: "strike" },
  { id: "code", labelKey: "code" },
  { id: "link", labelKey: "link" },
  { id: "latex", labelKey: "formula" },
  { id: "copy", labelKey: "copy" }
];

export const shortcutItems: { id: string; labelKey: TranslationKey; keys: string }[] = [
  { id: "shortcuts", labelKey: "shortcuts", keys: "⌘/" },
  { id: "open", labelKey: "openMarkdown", keys: "⌘O" },
  { id: "save", labelKey: "saveMarkdown", keys: "⌘S" },
  { id: "export", labelKey: "exportHtml", keys: "⌘E" },
  { id: "settings", labelKey: "editorSettings", keys: "⌘," },
  { id: "plugins", labelKey: "togglePlugins", keys: "⇧⌘P" },
  { id: "theme", labelKey: "toggleTheme", keys: "⇧⌘T" }
];

export const settingsSections = [
  { id: "general", labelKey: "general", subtitleKey: "generalSettingsSubtitle" },
  { id: "shortcuts", labelKey: "shortcuts", subtitleKey: "shortcutsSettingsSubtitle" },
  { id: "writing", labelKey: "writing", subtitleKey: "writingSettingsSubtitle" },
  { id: "selection", labelKey: "selectionMenu", subtitleKey: "selectionSettingsSubtitle" },
  { id: "plugins", labelKey: "plugins", subtitleKey: "pluginsSettingsSubtitle" }
] as const satisfies readonly { id: string; labelKey: TranslationKey; subtitleKey: TranslationKey }[];
export type SettingsSectionId = (typeof settingsSections)[number]["id"];

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getStoredNumber(key: string, fallback: number, min: number, max: number) {
  const raw = localStorage.getItem(key);
  const value = raw ? Number(raw) : fallback;
  return Number.isFinite(value) ? clampNumber(value, min, max) : fallback;
}

function isEditorWidthPreset(value: string | null): value is EditorWidthPresetId {
  return editorWidthPresets.some((preset) => preset.id === value);
}

function isTextFontPreset(value: string | null): value is TextFontPresetId {
  return textFontPresets.some((preset) => preset.id === value);
}

function isCodeFontPreset(value: string | null): value is CodeFontPresetId {
  return codeFontPresets.some((preset) => preset.id === value);
}

function isShellFontPreset(value: string | null): value is ShellFontPresetId {
  return shellFontPresets.some((preset) => preset.id === value);
}

function getLegacyEditorWidthPreset(width: number): EditorWidthPresetId {
  if (width <= 780) {
    return "small";
  }
  if (width >= 940) {
    return "large";
  }
  return "medium";
}

function isTheme(theme: string | null): theme is AppTheme {
  return themePresets.some((preset) => preset.id === theme);
}

export function getTheme() {
  const storedTheme = localStorage.getItem("tickpad:theme");
  if (isTheme(storedTheme)) {
    return storedTheme;
  }
  return isTheme(defaultConfig.theme) ? defaultConfig.theme : "light";
}

export function isSelectionToolbarTool(tool: unknown): tool is SelectionToolbarToolId {
  return typeof tool === "string" && (defaultSelectionToolbarTools as readonly string[]).includes(tool);
}

export function getEditorWidthPreset() {
  const raw = localStorage.getItem("tickpad:editor-width");
  if (isEditorWidthPreset(raw)) {
    return raw;
  }
  const legacyWidth = raw ? Number(raw) : NaN;
  return Number.isFinite(legacyWidth) ? getLegacyEditorWidthPreset(legacyWidth) : defaultEditorWidthPreset;
}

export function getRailWidth() {
  const storedRailWidth = getStoredNumber("tickpad:rail-width", defaultRailWidth, minRailWidth, maxRailWidth);
  return storedRailWidth === legacyDefaultRailWidth ? defaultRailWidth : storedRailWidth;
}

export function getTextFontPreset() {
  const raw = localStorage.getItem("tickpad:editor-text-font");
  return isTextFontPreset(raw) ? raw : defaultTextFontPreset;
}

export function getCodeFontPreset() {
  const raw = localStorage.getItem("tickpad:editor-code-font");
  return isCodeFontPreset(raw) ? raw : defaultCodeFontPreset;
}

export function getShellFontPreset() {
  const raw = localStorage.getItem("tickpad:shell-font");
  return isShellFontPreset(raw) ? raw : defaultShellFontPreset;
}

export function getEditorFontSize() {
  return getStoredNumber("tickpad:editor-font-size", defaultEditorFontSize, minEditorFontSize, maxEditorFontSize);
}

export function getCodeFontSize() {
  return getStoredNumber("tickpad:editor-code-font-size", defaultCodeFontSize, minCodeFontSize, maxCodeFontSize);
}

export function getSelectionToolbarSize() {
  return getStoredNumber("tickpad:selection-toolbar-size", defaultSelectionToolbarSize, minSelectionToolbarSize, maxSelectionToolbarSize);
}

export function getMarkdownSymbolMappingEnabled() {
  return localStorage.getItem("tickpad:markdown-symbol-mapping") !== "false";
}

export function setMarkdownSymbolMappingEnabled(enabled: boolean) {
  localStorage.setItem("tickpad:markdown-symbol-mapping", String(enabled));
}

export function getSelectionToolbarTools() {
  const raw = localStorage.getItem("tickpad:selection-toolbar-tools");
  if (!raw) {
    return [...defaultSelectionToolbarTools];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...defaultSelectionToolbarTools];
    }
    const tools = defaultSelectionToolbarTools.filter((tool) => parsed.some((item) => isSelectionToolbarTool(item) && item === tool));
    return tools.length ? tools : [...defaultSelectionToolbarTools];
  } catch {
    return [...defaultSelectionToolbarTools];
  }
}
