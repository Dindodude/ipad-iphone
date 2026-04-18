"use client";

import { useAppState } from "@/components/app-state-provider";
import { getAnalyticsSummaryFromSnapshot } from "@/lib/snapshot-helpers";

export default function AnalyticsPage() {
  const { snapshot } = useAppState();
  const analytics = getAnalyticsSummaryFromSnapshot(snapshot);

  return (
    <div className="stack">
      <section className="page-title card">
        <div className="eyebrow">Analytics</div>
        <h1>See what is converting, what is stalling, and what to do next.</h1>
        <p>This keeps the spirit of the old coach and analytics layer, but inside the multi-client command center.</p>
      </section>

      <section className="stats-grid four-grid">
        <div className="stat card"><strong>{analytics.replyRate}%</strong><span>Reply rate</span></div>
        <div className="stat card"><strong>{analytics.followUpRate}%</strong><span>Follow-up rate</span></div>
        <div className="stat card"><strong>{analytics.wonRate}%</strong><span>Won rate</span></div>
        <div className="stat card"><strong>{analytics.lostRate}%</strong><span>Lost rate</span></div>
      </section>

      <section className="workspace-grid wide-main">
        <div className="stack">
          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Stage conversion</div>
                <h2>Pipeline health</h2>
              </div>
            </div>
            <div className="text-list">
              {Object.entries(analytics.stageCounts).map(([stage, count]) => (
                <div key={stage} className="text-list-item"><strong>{stage}</strong><br />{count} leads</div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Top scripts</div>
                <h2>What gets reused</h2>
              </div>
            </div>
            <div className="text-list">
              {analytics.topScripts.map((script) => (
                <div key={script.title} className="text-list-item"><strong>{script.title}</strong><br />Used {script.usageCount} times</div>
              ))}
            </div>
          </section>
        </div>

        <aside className="stack">
          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Top categories</div>
                <h2>Best verticals</h2>
              </div>
            </div>
            <div className="text-list">
              {analytics.topCategories.map((item) => (
                <div key={item.category} className="text-list-item"><strong>{item.category}</strong><br />{item.count} leads</div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Coach ideas</div>
                <h2>What to do next</h2>
              </div>
            </div>
            <div className="text-list">
              {analytics.coachIdeas.map((idea) => (
                <div key={idea} className="text-list-item">{idea}</div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
