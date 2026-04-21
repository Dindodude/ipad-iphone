"use client";

import { DashboardCard } from "@/components/dashboard-card";
import { useAppState } from "@/components/app-state-provider";
import { getCampaignSummariesFromSnapshot } from "@/lib/snapshot-helpers";

export default function CampaignsPage() {
  const { snapshot } = useAppState();
  const campaigns = getCampaignSummariesFromSnapshot(snapshot);

  return (
    <div className="stack">
      <section className="page-title card">
        <div className="eyebrow">Campaigns</div>
        <h1>Separate source buckets without losing control.</h1>
        <p>Use campaigns and groups to organize missed calls, Facebook leads, instant forms, quote requests, and seasonal offers inside each client.</p>
      </section>
      <section className="dashboard-grid">
        {campaigns.map((summary) => (
          <DashboardCard key={summary.campaign.id} summary={summary} />
        ))}
      </section>
    </div>
  );
}
