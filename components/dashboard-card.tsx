import Link from "next/link";
import type { CampaignSummary } from "@/lib/types";

export function DashboardCard({ summary }: { summary: CampaignSummary }) {
  const href = `/app/dashboards/${summary.campaign.id}`;

  return (
    <Link href={href} className="card dashboard-card">
      <div className="dashboard-card-head">
        <div className="card-chip">{summary.campaign.source}</div>
        <h3>{summary.campaign.name}</h3>
      </div>
      <p>{summary.campaign.description}</p>
      <div className="dashboard-card-client">
        <span>Client</span>
        <strong>{summary.client.name}</strong>
      </div>
      <div className="dashboard-stat-row">
        <div className="dashboard-stat-pill">
          <span>Leads</span>
          <strong>{summary.leadCount}</strong>
        </div>
        <div className="dashboard-stat-pill">
          <span>Qualified</span>
          <strong>{summary.qualifiedCount}</strong>
        </div>
        <div className="dashboard-stat-pill">
          <span>Reply Rate</span>
          <strong>{summary.replyRate}%</strong>
        </div>
      </div>
    </Link>
  );
}
