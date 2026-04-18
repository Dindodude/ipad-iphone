"use client";

import Link from "next/link";
import { DashboardCard } from "@/components/dashboard-card";
import { useAppState } from "@/components/app-state-provider";
import { getCampaignSummariesFromSnapshot, getDashboardOverviewFromSnapshot } from "@/lib/snapshot-helpers";

export default function AppOverviewPage() {
  const { snapshot } = useAppState();
  const overview = getDashboardOverviewFromSnapshot(snapshot);
  const campaigns = getCampaignSummariesFromSnapshot(snapshot);

  return (
    <div className="stack">
      <section className="page-title card hero-command">
        <div className="eyebrow">LeadOS Dashboard</div>
        <h1>Run every client, campaign, and lead from one serious command center.</h1>
        <p>
          LeadOS is your internal agency machine: multi-client management, campaign buckets, WhatsApp-first outreach,
          AI-assisted messaging, and analytics that actually tell you what deserves action now.
        </p>
        <div className="quick-actions-row">
          <Link href="/app/settings" className="button">Import CSV</Link>
          <Link href="/app/clients" className="button-secondary">Create Client</Link>
          <Link href="/app/campaigns" className="button-secondary">Create Campaign</Link>
          <Link href="/app/pipeline" className="button-secondary">Add Lead</Link>
          <Link href="/app/ai" className="button-secondary">Generate Message</Link>
        </div>
      </section>

      <section className="stats-grid four-grid">
        <div className="stat card"><strong>{overview.totalLeads}</strong><span>Total leads</span></div>
        <div className="stat card"><strong>{overview.newLeads}</strong><span>New leads</span></div>
        <div className="stat card"><strong>{overview.leadsNeedingFollowUp}</strong><span>Need follow-up</span></div>
        <div className="stat card"><strong>{overview.hotLeads}</strong><span>Hot leads</span></div>
        <div className="stat card"><strong>{overview.repliedLeads}</strong><span>Replied</span></div>
        <div className="stat card"><strong>{overview.closedLeads}</strong><span>Closed won</span></div>
        <div className="stat card"><strong>{overview.whatsappReadyLeads}</strong><span>WhatsApp ready</span></div>
        <div className="stat card"><strong>{overview.topPerformingCampaign.replyRate}%</strong><span>Top campaign reply rate</span></div>
      </section>

      <section className="workspace-grid wide-main">
        <div className="stack">
          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Top campaign stack</div>
                <h2>Campaigns doing the work</h2>
              </div>
              <span>{campaigns.length} active campaigns</span>
            </div>
            <section className="dashboard-grid">
              {campaigns.map((summary) => (
                <DashboardCard key={summary.campaign.id} summary={summary} />
              ))}
            </section>
          </section>

          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Recent activity</div>
                <h2>What moved recently</h2>
              </div>
            </div>
            <div className="text-list">
              {overview.recentActivity.map((activity) => (
                <div key={activity.id} className="text-list-item">
                  <strong>{activity.leadName}</strong>
                  <br />
                  {activity.content}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="stack">
          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Top performers</div>
                <h2>Where momentum lives</h2>
              </div>
            </div>
            <div className="text-list">
              <div className="text-list-item">
                <strong>Top client</strong>
                <br />
                {overview.topPerformingClient.client.name} with {overview.topPerformingClient.leadCount} active leads.
              </div>
              <div className="text-list-item">
                <strong>Top campaign</strong>
                <br />
                {overview.topPerformingCampaign.campaign.name} at {overview.topPerformingCampaign.replyRate}% reply rate.
              </div>
            </div>
          </section>

          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">AI suggestions</div>
                <h2>Copilot recommendations</h2>
              </div>
            </div>
            <div className="text-list">
              {overview.aiSuggestions.map((suggestion) => (
                <div key={suggestion} className="text-list-item">{suggestion}</div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
