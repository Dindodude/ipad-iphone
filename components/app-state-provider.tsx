"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AppSnapshot, Category, Lead } from "@/lib/types";

const STORAGE_KEY = "leados-app-snapshot-v1";

type AppStateContextValue = {
  snapshot: AppSnapshot;
  ready: boolean;
  replaceSnapshot: (next: AppSnapshot) => void;
  resetAllInfo: () => void;
  updateLeads: (updater: (current: Lead[]) => Lead[]) => void;
  updateCategories: (updater: (current: Category[]) => Category[]) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({
  initialSnapshot,
  children
}: {
  initialSnapshot: AppSnapshot;
  children: React.ReactNode;
}) {
  const [snapshot, setSnapshot] = useState<AppSnapshot>(initialSnapshot);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppSnapshot;
        setSnapshot(parsed);
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {}
  }, [snapshot, ready]);

  const value = useMemo<AppStateContextValue>(() => ({
    snapshot,
    ready,
    replaceSnapshot: (next) => setSnapshot(next),
    resetAllInfo: () =>
      setSnapshot({
        clients: [],
        campaigns: [],
        leads: [],
        scripts: [],
        forms: [],
        categories: [],
        activityLogs: []
      }),
    updateLeads: (updater) =>
      setSnapshot((current) => ({
        ...current,
        leads: updater(current.leads)
      })),
    updateCategories: (updater) =>
      setSnapshot((current) => ({
        ...current,
        categories: updater(current.categories)
      }))
  }), [snapshot, ready]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
