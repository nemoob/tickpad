import { ArrowUp, AtSign, Settings2, Sparkles } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { getAiMentionQuery, getAiMentionSuggestions, type AiProfile } from "@tickpad/plugin-ai-writer";

import type { AppText } from "./i18n";

type AiWriterBarProps = {
  profiles: readonly AiProfile[];
  t: AppText;
  onGenerate: (request: string) => Promise<void>;
  onOpenSettings: () => void;
};

export function AiWriterBar({ profiles, t, onGenerate, onOpenSettings }: AiWriterBarProps) {
  const [request, setRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const mentionQuery = useMemo(() => getAiMentionQuery(request), [request]);
  const suggestions = useMemo(() => getAiMentionSuggestions(request, profiles), [profiles, request]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!request.trim() || submitting || profiles.length === 0) {
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onGenerate(request);
      setRequest("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.aiRequestFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ai-writer-shell">
      {(suggestions.length > 0 || (profiles.length === 0 && mentionQuery !== null)) && (
        <div className="ai-mention-menu" role="listbox" aria-label={t.aiProfiles}>
          {suggestions.map((profile) => (
            <button
              key={profile.id}
              type="button"
              role="option"
              onClick={() => setRequest(`@${profile.nickname} `)}
            >
              <AtSign size={14} />
              <span>{profile.nickname}</span>
              <small>{profile.model}</small>
            </button>
          ))}
          {profiles.length === 0 && mentionQuery !== null && (
            <button type="button" role="option" onClick={onOpenSettings}>
              <Settings2 size={14} />
              <span>{t.configureAiFirst}</span>
              <small>{t.configureAi}</small>
            </button>
          )}
        </div>
      )}
      <form className="ai-writer-bar" onSubmit={submit}>
        <Sparkles size={16} aria-hidden="true" />
        <input
          value={request}
          aria-label={t.aiWriter}
          placeholder={profiles.length > 0 ? t.aiWriterPlaceholder : t.configureAiFirst}
          onChange={(event) => setRequest(event.target.value)}
        />
        <button
          className="ai-writer-settings"
          type="button"
          title={t.configureAi}
          aria-label={t.configureAi}
          onClick={onOpenSettings}
        >
          <Settings2 size={15} />
        </button>
        <button
          className="ai-writer-submit"
          type="submit"
          title={t.generateArticle}
          aria-label={t.generateArticle}
          disabled={submitting || !request.trim() || profiles.length === 0}
        >
          <ArrowUp size={15} />
        </button>
      </form>
      {error && <span className="ai-writer-error" role="alert">{error}</span>}
    </div>
  );
}
