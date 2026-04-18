import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <div className="marketing-shell">
        <header className="marketing-nav">
          <div className="brand-inline">
            <div className="brand-badge">L</div>
            <div>
              <div className="brand-title">LeadOS</div>
              <div className="brand-subtitle">Premium multi-client outreach command center</div>
            </div>
          </div>
          <div className="cta-row">
            <Link href="/app" className="button">Open LeadOS</Link>
          </div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">Agency control room</div>
            <h1>Run clients, campaigns, leads, WhatsApp, and AI from one serious dark-mode machine.</h1>
            <p>
              LeadOS is built for operators, not demo-day fluff. Manage paying clients, split lead sources into campaigns,
              keep outreach WhatsApp-first, and use AI as a real sales copilot instead of a gimmick.
            </p>
            <div className="cta-row">
              <Link href="/app" className="button">Enter the command center</Link>
              <Link href="/app/pipeline" className="button-secondary">Open pipeline</Link>
            </div>
            <div className="metric-grid">
              <div className="metric">
                <strong>Clients</strong>
                <span>Separate businesses you service into clean accounts.</span>
              </div>
              <div className="metric">
                <strong>Campaigns</strong>
                <span>Break every source into its own execution lane.</span>
              </div>
              <div className="metric">
                <strong>WhatsApp</strong>
                <span>Keep the workflow built around the channel you actually use first.</span>
              </div>
              <div className="metric">
                <strong>AI</strong>
                <span>Generate messages, summaries, rankings, offers, and next steps.</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="eyebrow">V1 structure</div>
            <h2>What LeadOS already covers</h2>
            <div className="text-list">
              <div className="text-list-item">Dashboard, clients, campaigns, pipeline, lead detail, scripts, AI, forms, analytics, settings.</div>
              <div className="text-list-item">CSV import preview, backup export/import validation, category rules, auto-categorization test bed.</div>
              <div className="text-list-item">Global AI copilot with context-aware tasks for outreach and lead ops.</div>
              <div className="text-list-item">Hybrid layout: desktop power surface with mobile fallback that still feels intentional.</div>
            </div>
          </div>
        </section>

        <section className="feature-strip">
          <article className="card feature">
            <div className="eyebrow">Clients</div>
            <h3>Manage every paying business in one account</h3>
            <p>Each client gets campaigns, forms, scripts, lead flow, and performance visibility without mixing data.</p>
          </article>
          <article className="card feature">
            <div className="eyebrow">Pipeline</div>
            <h3>WhatsApp-first lead execution</h3>
            <p>Move from new leads to won deals with clear stage logic, urgency visibility, and fast lead actions.</p>
          </article>
          <article className="card feature">
            <div className="eyebrow">AI</div>
            <h3>Copilot that helps you move faster</h3>
            <p>Use AI for first messages, follow-ups, lead summaries, next actions, niche offers, and ranking the hottest leads.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
