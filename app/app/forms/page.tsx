"use client";

import { useAppState } from "@/components/app-state-provider";

export default function FormsPage() {
  const { snapshot } = useAppState();

  return (
    <div className="stack">
      <section className="page-title card">
        <div className="eyebrow">Instant Forms</div>
        <h1>Capture inbound leads into the right client and campaign automatically.</h1>
        <p>Every form can belong to one client and one campaign so incoming leads land cleanly in the right bucket, with default stage and AI-ready context.</p>
      </section>
      <section className="dashboard-grid">
        {snapshot.forms.map((form) => {
          const client = snapshot.clients.find((item) => item.id === form.clientId);
          const campaign = snapshot.campaigns.find((item) => item.id === form.campaignId);
          return (
            <article key={form.id} className="card dashboard-card">
              <div className="card-chip">{client?.name}</div>
              <h3>{form.name}</h3>
              <p>{campaign?.name}</p>
              <div className="meta-stack">
                <div className="meta-row"><span>Fields</span><strong>{form.fields.length}</strong></div>
                <div className="meta-row"><span>Default Stage</span><strong>{form.defaultStage}</strong></div>
                <div className="meta-row"><span>Submissions</span><strong>{form.submissions}</strong></div>
                <div className="meta-row"><span>Conversion</span><strong>{form.conversionRate}%</strong></div>
              </div>
              <div className="code-line">{typeof window !== "undefined" ? window.location.origin : ""}/api/forms/{form.campaignId}</div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
