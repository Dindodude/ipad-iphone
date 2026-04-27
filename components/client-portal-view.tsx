import styles from "./client-portal-view.module.css";

type PortalData = {
  input?: {
    businessName?: string;
    packageSelected?: string;
    timeline?: string;
  };
  status?: string;
  currentPhase?: string;
  startedAt?: string;
  outputs?: {
    welcomeDocument?: string;
    websitePlan?: string;
    contentPlan?: string;
    leadSystemPlan?: string;
  };
  leads?: Array<{
    name: string;
    phone: string;
    email?: string;
    source: string;
    dateSubmitted: string;
    status: string;
    notes?: string;
  }>;
  progress?: Array<{ label: string; status: string }>;
  tasks?: Array<{ label: string; status: string }>;
  approvals?: Array<{ label: string; status: string }>;
  updates?: Array<{ message: string; date: string }>;
};

export function ClientPortalView({ portal }: { portal: { business_name: string; portal_data: PortalData } }) {
  const data = portal.portal_data || {};
  const input = data.input || {};
  const leads = data.leads || [];
  const progress = data.progress || defaultProgress();
  const tasks = data.tasks || [];
  const approvals = data.approvals || [];
  const updates = data.updates || [];
  const submitted = leads.length;
  const calls = leads.filter((lead) => lead.source === "Website Form" || lead.source === "Manual").length;
  const converted = leads.filter((lead) => lead.status === "Closed").length;

  return (
    <main className={styles.root}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Zentrixa Client Portal</p>
        <h1>{input.businessName || portal.business_name}</h1>
        <p>Your project progress, generated plans, action items, approvals, and lead results in one simple place.</p>
        <div className={styles.badgeRow}>
          <span>Status: {data.status || "New"}</span>
          <span>Package: {input.packageSelected || "Not set"}</span>
          <span>Started: {data.startedAt ? new Date(data.startedAt).toLocaleDateString() : "Not set"}</span>
          <span>Timeline: {input.timeline || "Not set"}</span>
          <span>Phase: {data.currentPhase || "Onboarding"}</span>
        </div>
      </section>

      <section className={styles.metrics}>
        <Metric label="Leads generated" value={leads.length} />
        <Metric label="Forms submitted" value={submitted} />
        <Metric label="Calls requested" value={calls} />
        <Metric label="New inquiries" value={leads.filter((lead) => lead.status === "New").length} />
        <Metric label="Converted" value={converted} />
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.kicker}>Project Progress</p>
          <div className={styles.steps}>
            {progress.map((step) => (
              <div key={step.label} className={styles.step}>
                <b>{step.label}</b>
                <span>{step.status}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className={styles.card}>
          <p className={styles.kicker}>Client Action Items</p>
          <div className={styles.tasks}>
            {tasks.length ? tasks.map((task) => <span key={task.label} className={styles.task}>{task.label}: {task.status}</span>) : <span className={styles.task}>No tasks assigned yet.</span>}
          </div>
          <p className={styles.kicker}>Approvals</p>
          <div className={styles.tasks}>
            {approvals.length ? approvals.map((item) => <span key={item.label} className={styles.task}>{item.label}: {item.status}</span>) : <span className={styles.task}>No approvals requested yet.</span>}
          </div>
        </aside>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.kicker}>Lead Tracking</p>
          <div className={styles.leadList}>
            {leads.length ? leads.map((lead) => (
              <div key={`${lead.name}-${lead.dateSubmitted}`} className={styles.lead}>
                <b>{lead.name}</b>
                <span>{lead.phone} {lead.email ? `- ${lead.email}` : ""}</span>
                <span>{lead.source} - {lead.status} - {lead.dateSubmitted}</span>
                {lead.notes ? <span>{lead.notes}</span> : null}
              </div>
            )) : <div className={styles.lead}>No leads generated yet.</div>}
          </div>
        </div>
        <aside className={styles.card}>
          <p className={styles.kicker}>Updates</p>
          <div className={styles.updates}>
            {updates.length ? updates.map((update) => (
              <div key={`${update.message}-${update.date}`} className={styles.update}>
                <b>{update.message}</b>
                <span>{update.date}</span>
              </div>
            )) : <div className={styles.update}>No updates posted yet.</div>}
          </div>
        </aside>
      </section>

      <section className={styles.docs}>
        <Doc title="Welcome Document" text={data.outputs?.welcomeDocument} />
        <Doc title="Website Plan" text={data.outputs?.websitePlan} />
        <Doc title="Content Plan" text={data.outputs?.contentPlan} />
        <Doc title="Lead System Plan" text={data.outputs?.leadSystemPlan} />
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <article className={styles.metric}><strong>{value}</strong><span>{label}</span></article>;
}

function Doc({ title, text }: { title: string; text?: string }) {
  return <article className={styles.docCard}><p className={styles.kicker}>{title}</p><pre>{text || "Not generated yet."}</pre></article>;
}

function defaultProgress() {
  return [
    { label: "Onboarding", status: "In progress" },
    { label: "Website Draft", status: "Not started" },
    { label: "Content Plan", status: "Not started" },
    { label: "Lead System Setup", status: "Not started" },
    { label: "Launch", status: "Not started" },
    { label: "Growth Tracking", status: "Not started" }
  ];
}
