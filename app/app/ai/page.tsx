export default function AIPage() {
  return (
    <div className="stack">
      <section className="page-title card">
        <div className="eyebrow">AI Assistant</div>
        <h1>Use the copilot like a real outreach operator.</h1>
        <p>The right rail is global on every page. This page gives you the operating rules for how to use it well inside LeadOS.</p>
      </section>
      <section className="dashboard-grid">
        <article className="card feature">
          <div className="eyebrow">Message generation</div>
          <h3>First messages and follow-ups</h3>
          <p>Use client, campaign, lead, stage, and notes together so the AI speaks in context instead of vague generic marketing language.</p>
        </article>
        <article className="card feature">
          <div className="eyebrow">Lead intelligence</div>
          <h3>Summaries and next actions</h3>
          <p>Ask for one-paragraph summaries, next-step recommendations, and hottest-lead ranking when the queue gets crowded.</p>
        </article>
        <article className="card feature">
          <div className="eyebrow">Offer building</div>
          <h3>Niche-specific offers</h3>
          <p>Use the AI to turn niche context into tight offers for auto shops, real estate teams, and any other client vertical.</p>
        </article>
      </section>
    </div>
  );
}
