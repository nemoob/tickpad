import { useCallback, useEffect, useState } from "react";

import type { UpdateCheckResult } from "./types";

export type UpdateStatus = "idle" | "checking" | "available" | "none" | "error";

const autoUpdateStorageKey = "tickpad:auto-update";

const getAutoUpdateEnabled = () => localStorage.getItem(autoUpdateStorageKey) !== "false";

export function useAppUpdates() {
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(getAutoUpdateEnabled);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("idle");
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [updatePrompt, setUpdatePrompt] = useState<UpdateCheckResult | null>(null);

  const checkForUpdates = useCallback(async () => {
    setUpdateStatus("checking");
    try {
      const result = await window.tickpad?.checkForUpdates();
      if (!result) {
        setUpdateStatus("error");
        return null;
      }
      setUpdateResult(result);
      if (result.available) {
        setUpdateStatus("available");
        setUpdatePrompt(result);
      } else {
        setUpdateStatus(result.error ? "error" : "none");
      }
      return result;
    } catch {
      setUpdateStatus("error");
      return null;
    }
  }, []);

  const openUpdatePage = useCallback(async (downloadUrl?: string) => {
    setUpdatePrompt(null);
    if (downloadUrl) {
      await window.tickpad?.openExternal(downloadUrl);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(autoUpdateStorageKey, autoUpdateEnabled ? "true" : "false");
  }, [autoUpdateEnabled]);

  useEffect(() => {
    if (autoUpdateEnabled) {
      void checkForUpdates();
    }
  }, [autoUpdateEnabled, checkForUpdates]);

  return {
    autoUpdateEnabled,
    updatePrompt,
    updateResult,
    updateStatus,
    checkForUpdates,
    dismissUpdatePrompt: () => setUpdatePrompt(null),
    openUpdatePage,
    setAutoUpdateEnabled
  };
}
