"use client";

import Link from "next/link";
import { useAppState } from "@/components/app-state-provider";
import { getClientSummariesFromSnapshot } from "@/lib/snapshot-helpers";

export default function ClientsPage() {
  const { snapshot } = useAppState();
  const summaries = getClientSummariesFromSnapshot(snapshot);

  return (
    <div className="stack">
      <section className="page-title card">
        <div className="eyebrow">Clients</div>
        <h1>Manage every paying business you service.</h1>
        <p>Each client holds campaigns, lead flow, notes, performance context, and outreach execution in one clean layer.</p>
      </section>
      <section className="dashboard-grid">
        {summaries.map((summary) => (
          <article key={summary.client.id} className="card dashboard-card">
            <div className="card-chip">{summary.client.niche}</div>
            <h3>{summary.client.name}</h3>
            <p>{summary.client.notes}</p>
            <div className="meta-stack">
              <div className="meta-row"><span>Campaigns</span><strong>{summary.campaignCount}</strong></div>
              <div className="meta-row"><span>Leads</span><strong>{summary.leadCount}</strong></div>
              <div className="meta-row"><span>Hot</span><strong>{summary.hotLeadCount}</strong></div>
              <div className="meta-row"><span>Won</span><strong>{summary.wonCount}</strong></div>
            </div>
            <div className="button-row">
              <Link href="/app/campaigns" className="tiny-button">View campaigns</Link>
              <Link href="/app/pipeline" className="tiny-button">Open pipeline</Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
