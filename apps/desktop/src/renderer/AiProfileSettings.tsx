import { KeyRound, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import type { AiProfile } from "@tickpad/plugin-ai-writer";

import type { AppText } from "./i18n";

export type AiProfileDraft = AiProfile & { apiKey: string };

type AiProfileSettingsProps = {
  profiles: readonly AiProfile[];
  secretProfileIds: ReadonlySet<string>;
  t: AppText;
  onDelete: (profileId: string) => Promise<void>;
  onSave: (draft: AiProfileDraft) => Promise<void>;
};

const createDraft = (): AiProfileDraft => ({
  id: crypto.randomUUID(),
  nickname: "",
  baseUrl: "https://api.openai.com/v1",
  model: "",
  systemPrompt: "",
  apiKey: ""
});

export function AiProfileSettings({ profiles, secretProfileIds, t, onDelete, onSave }: AiProfileSettingsProps) {
  const [draft, setDraft] = useState<AiProfileDraft>(() => createDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (editingId && !profiles.some((profile) => profile.id === editingId)) {
      setEditingId(null);
      setDraft(createDraft());
    }
  }, [editingId, profiles]);

  const editProfile = (profile: AiProfile) => {
    setEditingId(profile.id);
    setDraft({ ...profile, systemPrompt: profile.systemPrompt ?? "", apiKey: "" });
    setMessage("");
  };

  const startNew = () => {
    setEditingId(null);
    setDraft(createDraft());
    setMessage("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await onSave(draft);
      setMessage(t.aiProfileSaved);
      setDraft((current) => ({ ...current, apiKey: "" }));
      setEditingId(draft.id);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : t.aiProfileSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const removeProfile = async (profileId: string) => {
    setSaving(true);
    setMessage("");
    try {
      await onDelete(profileId);
      setMessage(t.aiProfileDeleted);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : t.aiProfileDeleteFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ai-profile-settings">
      <div className="settings-row ai-profile-heading">
        <div>
          <span>{t.aiProfiles}</span>
          <small>{t.aiProfilesDescription}</small>
        </div>
        <button className="plugin-install-action" type="button" onClick={startNew}>
          <Plus size={15} />{t.addAiProfile}
        </button>
      </div>

      {profiles.length > 0 && (
        <div className="ai-profile-list">
          {profiles.map((profile) => (
            <button
              className={profile.id === draft.id ? "ai-profile-row selected" : "ai-profile-row"}
              key={profile.id}
              type="button"
              onClick={() => editProfile(profile)}
            >
              <span className="ai-profile-avatar">@</span>
              <span><strong>{profile.nickname}</strong><small>{profile.model}</small></span>
              <span className={secretProfileIds.has(profile.id) ? "ai-secret-status ready" : "ai-secret-status"}>
                <KeyRound size={13} />{secretProfileIds.has(profile.id) ? t.apiKeyStored : t.apiKeyMissing}
              </span>
            </button>
          ))}
        </div>
      )}

      <form className="ai-profile-form" onSubmit={submit}>
        <label><span>{t.aiNickname}</span><input required value={draft.nickname} onChange={(event) => setDraft({ ...draft, nickname: event.target.value })} /></label>
        <label><span>{t.aiEndpoint}</span><input required type="url" value={draft.baseUrl} onChange={(event) => setDraft({ ...draft, baseUrl: event.target.value })} /></label>
        <label><span>{t.aiModel}</span><input required value={draft.model} onChange={(event) => setDraft({ ...draft, model: event.target.value })} /></label>
        <label><span>{t.apiKey}</span><input type="password" autoComplete="new-password" placeholder={secretProfileIds.has(draft.id) ? t.apiKeyKeepPlaceholder : ""} value={draft.apiKey} onChange={(event) => setDraft({ ...draft, apiKey: event.target.value })} /></label>
        <label className="wide"><span>{t.systemPrompt}</span><textarea rows={3} value={draft.systemPrompt} onChange={(event) => setDraft({ ...draft, systemPrompt: event.target.value })} /></label>
        <div className="ai-profile-form-actions wide">
          {editingId && (
            <button className="danger-text-button" type="button" disabled={saving} onClick={() => void removeProfile(editingId)}>
              <Trash2 size={14} />{t.deleteAiProfile}
            </button>
          )}
          <span aria-live="polite">{message}</span>
          <button className="plugin-settings-action" type="submit" disabled={saving}>{saving ? t.saving : t.saveAiProfile}</button>
        </div>
      </form>
      <p className="ai-secret-note">{t.apiKeySecurityNote}</p>
    </div>
  );
}
