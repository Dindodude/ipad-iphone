import Link from "next/link";
import type { CampaignSummary } from "@/lib/types";

export function DashboardCard({ summary }: { summary: CampaignSummary }) {
  const href = `/app/dashboards/${summary.campaign.id}`;

  return (
    <Link href={href} className="card dashboard-card">
      <div className="card-chip">{summary.campaign.source}</div>
      <h3>{summary.campaign.name}</h3>
      <p>{summary.campaign.description}</p>
      <div className="meta-stack">
        <div className="meta-row">
          <span>Client</span>
          <strong>{summary.client.name}</strong>
        </div>
        <div className="meta-row">
          <span>Leads</span>
          <strong>{summary.leadCount}</strong>
        </div>
        <div className="meta-row">
          <span>Qualified</span>
          <strong>{summary.qualifiedCount}</strong>
        </div>
        <div className="meta-row">
          <span>Reply Rate</span>
          <strong>{summary.replyRate}%</strong>
        </div>
      </div>
    </Link>
  );
}
