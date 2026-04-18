import { DashboardCard } from "@/components/dashboard-card";
import { getCampaignSummaries } from "@/lib/data";

export default async function DashboardsPage() {
  const campaigns = await getCampaignSummaries();

  return (
    <div className="stack">
      <section className="page-title card">
        <div className="eyebrow">Campaign dashboards</div>
        <h1>Each campaign is its own execution surface.</h1>
        <p>
          Keep every source bucket clean: instant forms, Facebook leads, missed calls, reactivation, and seasonal offers
          should each have their own command lane.
        </p>
      </section>
      <section className="dashboard-grid">
        {campaigns.map((summary) => (
          <DashboardCard key={summary.campaign.id} summary={summary} />
        ))}
      </section>
    </div>
  );
}
