export default function LegacyLeadOSPage() {
  return (
    <div className="stack">
      <section className="page-title card">
        <div className="eyebrow">Legacy Mode</div>
        <h1>Old LeadOS, preserved exactly as its own working system.</h1>
        <p>
          This is the original standalone LeadOS running as a dedicated isolated legacy surface inside the new app, so you
          can keep using the old workflow while the new system matures.
        </p>
        <div className="button-row">
          <a className="button" href="/legacy-leados.html" target="_blank" rel="noreferrer">Open Old LeadOS</a>
          <a className="button-secondary" href="/legacy-leados.html">Switch to Legacy Mode</a>
        </div>
      </section>

      <section className="workspace-grid wide-main">
        <div className="stack">
          <section className="card legacy-frame-card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Legacy runtime</div>
                <h2>Full original LeadOS</h2>
              </div>
              <span>Exact standalone copy</span>
            </div>
            <iframe
              className="legacy-frame"
              src="/legacy-leados.html"
              title="Legacy LeadOS"
            />
          </section>
        </div>

        <aside className="stack">
          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Why this exists</div>
                <h2>Safe transition path</h2>
              </div>
            </div>
            <div className="text-list">
              <div className="text-list-item">The old app stays usable while the new system is refined.</div>
              <div className="text-list-item">Legacy Mode is intentionally not redesigned so the original flow stays familiar.</div>
              <div className="text-list-item">This route uses the old standalone file directly instead of trying to reinterpret it.</div>
            </div>
          </section>

          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Sync path</div>
                <h2>Move between old and new</h2>
              </div>
            </div>
            <div className="text-list">
              <div className="text-list-item">Use the old app's backup/export and import flow as the safe fallback bridge.</div>
              <div className="text-list-item">Use the new Settings page for CSV mapping, backup validation, and category setup.</div>
              <div className="text-list-item">This keeps both systems available without forcing the legacy code into the new architecture.</div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
