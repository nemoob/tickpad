import type { ChangeEvent } from "react";

type PlainTextSurfaceProps = {
  text: string;
  onChange: (text: string) => void;
};

export function PlainTextSurface({ text, onChange }: PlainTextSurfaceProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.currentTarget.value);
  };

  return (
    <textarea
      aria-label="Plain text editor"
      className="plain-text-editor"
      data-testid="plain-text-editor"
      spellCheck={false}
      value={text}
      wrap="off"
      onChange={handleChange}
    />
  );
}
