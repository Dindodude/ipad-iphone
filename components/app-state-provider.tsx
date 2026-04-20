"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AppSnapshot, Category, Lead } from "@/lib/types";

const STORAGE_KEY = "leados-app-snapshot-v1";

function safeArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeLead(raw: unknown): Lead | null {
  if (!raw || typeof raw !== "object") return null;
  const lead = raw as Partial<Lead>;
  if (!lead.id || !lead.clientId || !lead.campaignId) return null;

  return {
    id: String(lead.id),
    clientId: String(lead.clientId),
    campaignId: String(lead.campaignId),
    name: String(lead.name ?? ""),
    businessName: String(lead.businessName ?? lead.name ?? ""),
    phone: String(lead.phone ?? ""),
    email: String(lead.email ?? ""),
    address: String(lead.address ?? ""),
    city: String(lead.city ?? ""),
    niche: String(lead.niche ?? ""),
    source: String(lead.source ?? ""),
    whatsappStatus: lead.whatsappStatus === "yes" || lead.whatsappStatus === "no" ? lead.whatsappStatus : "unknown",
    leadStage: typeof lead.leadStage === "string" ? lead.leadStage as Lead["leadStage"] : "New",
    priority: lead.priority === "high" || lead.priority === "low" ? lead.priority : "medium",
    tags: Array.isArray(lead.tags) ? lead.tags.map((item) => String(item)) : [],
    notes: String(lead.notes ?? ""),
    aiSummary: String(lead.aiSummary ?? ""),
    aiNextAction: String(lead.aiNextAction ?? ""),
    score: Number.isFinite(lead.score) ? Number(lead.score) : 0,
    lastContactedAt: lead.lastContactedAt ? String(lead.lastContactedAt) : "",
    nextFollowUpAt: lead.nextFollowUpAt ? String(lead.nextFollowUpAt) : "",
    createdAt: String(lead.createdAt ?? ""),
    updatedAt: String(lead.updatedAt ?? ""),
    previousMessages: Array.isArray(lead.previousMessages) ? lead.previousMessages.map((item) => String(item)) : []
  };
}

function normalizeSnapshot(raw: unknown, fallback: AppSnapshot): AppSnapshot {
  if (!raw || typeof raw !== "object") return fallback;
  const snapshot = raw as Partial<AppSnapshot>;

  return {
    clients: safeArray(snapshot.clients, fallback.clients),
    campaigns: safeArray(snapshot.campaigns, fallback.campaigns),
    leads: safeArray(snapshot.leads, []).map(normalizeLead).filter((lead): lead is Lead => Boolean(lead)),
    scripts: safeArray(snapshot.scripts, fallback.scripts),
    forms: safeArray(snapshot.forms, fallback.forms),
    categories: safeArray(snapshot.categories, fallback.categories),
    activityLogs: safeArray(snapshot.activityLogs, fallback.activityLogs)
  };
}

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
        const parsed = JSON.parse(raw);
        setSnapshot(normalizeSnapshot(parsed, initialSnapshot));
      }
    } catch {}
    setReady(true);
  }, [initialSnapshot]);

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
