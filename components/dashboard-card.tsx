import Link from "next/link";
import type { CampaignSummary } from "@/lib/types";

type DashboardCardProps = {
  summary: CampaignSummary;
  confirmingDelete?: boolean;
  onDeleteRequest?: () => void;
  onDeleteConfirm?: () => void;
  onDeleteCancel?: () => void;
};

export function DashboardCard({
  summary,
  confirmingDelete = false,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel
}: DashboardCardProps) {
  const href = `/app/dashboards/${summary.campaign.id}`;

  return (
    <article className="card dashboard-card">
      <div className="card-actions-top">
        <div className="dashboard-card-head">
          <div className="card-chip">{summary.campaign.source}</div>
          <h3>{summary.campaign.name}</h3>
        </div>
        {confirmingDelete ? (
          <div className="card-delete-confirm">
            <button type="button" className="ghost-button red card-delete-mini" onClick={onDeleteConfirm}>Confirm</button>
            <button type="button" className="ghost-button card-delete-mini" onClick={onDeleteCancel}>Cancel</button>
          </div>
        ) : (
          <button type="button" className="card-delete-button" aria-label={`Delete ${summary.campaign.name}`} onClick={onDeleteRequest}>×</button>
        )}
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
      <div className="button-row">
        <Link href={href} className="tiny-button">Open campaign</Link>
        <Link href="/app/pipeline" className="tiny-button">View pipeline</Link>
      </div>
    </article>
  );
}
