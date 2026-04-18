"use client";

import { SettingsWorkspace } from "@/components/settings-workspace";
import { useAppState } from "@/components/app-state-provider";

export default function SettingsPage() {
  const { snapshot } = useAppState();

  return (
    <div className="stack">
      <section className="page-title card">
        <div className="eyebrow">Settings</div>
        <h1>Keep the utility layer strong.</h1>
        <p>Backup/import, CSV mapping, category rules, auto-categorization, and the operational defaults all live here.</p>
      </section>
      <SettingsWorkspace snapshot={snapshot} />
    </div>
  );
}
