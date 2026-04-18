"use client";

import { useState } from "react";
import type { Campaign, Client, Script, ScriptType } from "@/lib/types";

const labels: Record<ScriptType, string> = {
  "first-touch": "First Touch",
  "follow-up": "Follow Up",
  niche: "Niche Offer",
  objection: "Objection Handling",
  reactivation: "Reactivation",
  "ai-generated": "AI Generated"
};

export function ScriptLibrary({
  scripts,
  clients,
  campaigns
}: {
  scripts: Script[];
  clients: Client[];
  campaigns: Campaign[];
}) {
  const [copiedId, setCopiedId] = useState("");
  const groups = Object.entries(
    scripts.reduce<Record<ScriptType, Script[]>>(
      (acc, script) => {
        acc[script.type].push(script);
        return acc;
      },
      {
        "first-touch": [],
        "follow-up": [],
        niche: [],
        objection: [],
        reactivation: [],
        "ai-generated": []
      }
    )
  ) as Array<[ScriptType, Script[]]>;

  return (
    <div className="stack">
      {groups.map(([type, items]) => (
        <section key={type} className="card">
          <div className="section-head">
            <div>
              <div className="eyebrow">Scripts</div>
              <h2>{labels[type]}</h2>
            </div>
            <span>{items.length} templates</span>
          </div>
          <div className="script-grid">
            {items.map((script) => {
              const client = clients.find((item) => item.id === script.clientId);
              const campaign = campaigns.find((item) => item.id === script.campaignId);

              return (
                <article key={script.id} className="script-card">
                  <div className="card-chip">{script.category}</div>
                  <h3>{script.title}</h3>
                  <div className="script-body">{script.content}</div>
                  <div className="meta-stack">
                    <div className="meta-row">
                      <span>Client</span>
                      <strong>{client?.name ?? "Global"}</strong>
                    </div>
                    <div className="meta-row">
                      <span>Campaign</span>
                      <strong>{campaign?.name ?? "All campaigns"}</strong>
                    </div>
                  </div>
                  <div className="button-row">
                    <button
                      className="tiny-button"
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(script.content);
                        setCopiedId(script.id);
                        window.setTimeout(() => setCopiedId(""), 1400);
                      }}
                    >
                      {copiedId === script.id ? "Copied" : "Copy"}
                    </button>
                    <button className="tiny-button" type="button">Edit</button>
                    <button className="tiny-button" type="button">Assign</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
