import { useState } from "react";

import { codeBlockStylePresets, getCodeBlockStyle, setCodeBlockStyle, type CodeBlockStyleId } from "./code-block-style";
import type { AppText } from "./i18n";
import {
  clampNumber,
  codeFontPresets,
  editorWidthPresets,
  getMarkdownSymbolMappingEnabled,
  maxCodeFontSize,
  maxEditorFontSize,
  minCodeFontSize,
  minEditorFontSize,
  setMarkdownSymbolMappingEnabled,
  shellFontPresets,
  textFontPresets,
  type CodeFontPresetId,
  type EditorWidthPresetId,
  type ShellFontPresetId,
  type TextFontPresetId
} from "./preferences";

export type FontPreset = {
  labelKey: keyof AppText;
  sample: string;
  stack: string;
};

export type WidthPreset = {
  labelKey: keyof AppText;
  ratio: number;
};

type WritingSettingsProps = {
  codeFontPreset: CodeFontPresetId;
  currentCodeFontPreset: FontPreset;
  currentEditorWidthPreset: WidthPreset;
  currentShellFontPreset: FontPreset;
  currentTextFontPreset: FontPreset;
  editorCodeFontSize: number;
  editorFontSize: number;
  editorWidthPreset: EditorWidthPresetId;
  shellFontPreset: ShellFontPresetId;
  t: AppText;
  textFontPreset: TextFontPresetId;
  onCodeFontPresetChange: (preset: CodeFontPresetId) => void;
  onCodeFontSizeChange: (size: number) => void;
  onEditorFontSizeChange: (size: number) => void;
  onEditorWidthPresetChange: (preset: EditorWidthPresetId) => void;
  onShellFontPresetChange: (preset: ShellFontPresetId) => void;
  onTextFontPresetChange: (preset: TextFontPresetId) => void;
};

export function WritingSettings({
  codeFontPreset,
  currentCodeFontPreset,
  currentEditorWidthPreset,
  currentShellFontPreset,
  currentTextFontPreset,
  editorCodeFontSize,
  editorFontSize,
  editorWidthPreset,
  shellFontPreset,
  t,
  textFontPreset,
  onCodeFontPresetChange,
  onCodeFontSizeChange,
  onEditorFontSizeChange,
  onEditorWidthPresetChange,
  onShellFontPresetChange,
  onTextFontPresetChange
}: WritingSettingsProps) {
  const [codeBlockStyle, setCodeBlockStyleState] = useState<CodeBlockStyleId>(() => getCodeBlockStyle());
  const [markdownSymbolMapping, setMarkdownSymbolMapping] = useState(() => getMarkdownSymbolMappingEnabled());
  const changeCodeBlockStyle = (nextStyle: CodeBlockStyleId) => {
    setCodeBlockStyleState(nextStyle);
    setCodeBlockStyle(nextStyle);
  };
  const changeMarkdownSymbolMapping = (nextEnabled: boolean) => {
    setMarkdownSymbolMapping(nextEnabled);
    setMarkdownSymbolMappingEnabled(nextEnabled);
  };

  return (
    <div className="settings-page">
      <div className="settings-section">
        <span className="settings-section-title">{t.writing}</span>
        <div className="settings-list-row">
          <div className="settings-row">
            <span>{t.editorWidth}</span>
            <strong>{t[currentEditorWidthPreset.labelKey]}</strong>
          </div>
          <div className="settings-segmented" aria-label={t.editorWidth}>
            {editorWidthPresets.map((preset) => (
              <button
                className={preset.id === editorWidthPreset ? "settings-segment selected" : "settings-segment"}
                key={preset.id}
                type="button"
                aria-pressed={preset.id === editorWidthPreset}
                title={`${t[preset.labelKey]} ${t.editorWidth}`}
                onClick={() => onEditorWidthPresetChange(preset.id)}
              >
                <span>{t[preset.labelKey]}</span>
                <strong>{preset.ratio}%</strong>
              </button>
            ))}
          </div>
        </div>
        <FontPicker
          activeId={textFontPreset}
          ariaLabel={t.textFont}
          currentLabel={t[currentTextFontPreset.labelKey]}
          label={t.textFont}
          presets={textFontPresets}
          t={t}
          onChange={onTextFontPresetChange}
        />
        <FontPicker
          activeId={codeFontPreset}
          ariaLabel={t.codeFont}
          currentLabel={t[currentCodeFontPreset.labelKey]}
          label={t.codeFont}
          presets={codeFontPresets}
          t={t}
          onChange={onCodeFontPresetChange}
        />
        <div className="settings-list-row stacked">
          <div className="settings-row">
            <span>{t.codeBlockStyle}</span>
            <strong>{t[codeBlockStylePresets.find((preset) => preset.id === codeBlockStyle)?.labelKey ?? "codeBlockSoft"]}</strong>
          </div>
          <div className="code-block-style-list">
            {codeBlockStylePresets.map((preset) => (
              <button
                className={preset.id === codeBlockStyle ? "code-block-style-card selected" : "code-block-style-card"}
                key={preset.id}
                type="button"
                aria-pressed={preset.id === codeBlockStyle}
                onClick={() => changeCodeBlockStyle(preset.id)}
              >
                <span className={`code-block-style-swatch ${preset.id}`} />
                <strong>{t[preset.labelKey]}</strong>
                <span>{t[preset.descriptionKey]}</span>
              </button>
            ))}
          </div>
        </div>
        <FontPicker
          activeId={shellFontPreset}
          ariaLabel={t.shellFont}
          currentLabel={t[currentShellFontPreset.labelKey]}
          label={t.shellFont}
          presets={shellFontPresets}
          t={t}
          onChange={onShellFontPresetChange}
        />
        <div className="settings-list-row">
          <div className="settings-row">
            <span>{t.markdownSymbolMapping}</span>
            <strong>{markdownSymbolMapping ? t.enabled : t.disabled}</strong>
          </div>
          <label className="settings-check">
            <input
              type="checkbox"
              checked={markdownSymbolMapping}
              onChange={(event) => changeMarkdownSymbolMapping(event.target.checked)}
            />
            <span>{t.markdownSymbolMappingDescription}</span>
          </label>
        </div>
        <label className="settings-list-row">
          <div className="settings-row">
            <span>{t.textSize}</span>
            <strong>{editorFontSize}px</strong>
          </div>
          <input
            type="range"
            min={minEditorFontSize}
            max={maxEditorFontSize}
            step={1}
            value={editorFontSize}
            onChange={(event) => onEditorFontSizeChange(clampNumber(Number(event.target.value), minEditorFontSize, maxEditorFontSize))}
          />
        </label>
        <label className="settings-list-row">
          <div className="settings-row">
            <span>{t.codeSize}</span>
            <strong>{editorCodeFontSize}px</strong>
          </div>
          <input
            type="range"
            min={minCodeFontSize}
            max={maxCodeFontSize}
            step={1}
            value={editorCodeFontSize}
            onChange={(event) => onCodeFontSizeChange(clampNumber(Number(event.target.value), minCodeFontSize, maxCodeFontSize))}
          />
        </label>
      </div>
    </div>
  );
}

function FontPicker<T extends string>({
  activeId,
  ariaLabel,
  currentLabel,
  label,
  presets,
  t,
  onChange
}: {
  activeId: T;
  ariaLabel: string;
  currentLabel: string;
  label: string;
  presets: readonly ({ id: T } & FontPreset)[];
  t: AppText;
  onChange: (id: T) => void;
}) {
  return (
    <div className="settings-list-row">
      <div className="settings-row">
        <span>{label}</span>
        <strong>{currentLabel}</strong>
      </div>
      <select
        className="settings-select"
        aria-label={ariaLabel}
        value={activeId}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id} style={{ fontFamily: preset.stack }}>
            {t[preset.labelKey]}
          </option>
        ))}
      </select>
    </div>
  );
}
