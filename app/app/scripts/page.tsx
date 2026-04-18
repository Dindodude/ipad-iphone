"use client";

import { ScriptLibrary } from "@/components/script-library";
import { useAppState } from "@/components/app-state-provider";

export default function ScriptsPage() {
  const { snapshot } = useAppState();

  return (
    <div className="stack">
      <section className="page-title card">
        <div className="eyebrow">Scripts</div>
        <h1>Keep every outreach angle organized and reusable.</h1>
        <p>First touch, follow-up, niche offers, objections, reactivation, and AI-generated scripts all live in one tighter system.</p>
      </section>
      <ScriptLibrary scripts={snapshot.scripts} clients={snapshot.clients} campaigns={snapshot.campaigns} />
    </div>
  );
}
