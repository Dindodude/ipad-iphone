"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./client-builder.module.css";

type BuilderView = "home" | "new" | "clients" | "detail";
type ClientStatus = "New" | "Onboarding" | "In Progress" | "Waiting for Client" | "Completed";
type PortalProjectStatus = "New" | "Onboarding" | "Website Build" | "Content Setup" | "Ads Setup" | "Waiting for Client" | "Live" | "Completed";
type PortalAccessStatus = "Active" | "Disabled";
type PortalStepStatus = "Not started" | "In progress" | "Waiting for client" | "Completed";
type PortalTaskStatus = "Pending" | "Submitted" | "Approved";
type PortalLeadStatus = "New" | "Contacted" | "Booked" | "Closed";
type PortalLeadSource = "Meta Form" | "Website Form" | "Instagram" | "Manual";

type ClientInput = {
  businessName: string;
  ownerName: string;
  industry: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  servicesOffered: string;
  targetCustomers: string;
  mainGoal: string;
  currentProblems: string;
  uniqueSellingPoints: string;
  competitors: string;
  packageSelected: string;
  projectType: string;
  brandColors: string;
  stylePreference: string;
  timeline: string;
  discoveryNotes: string;
};

type ClientOutputs = {
  welcomeDocument: string;
  websitePlan: string;
  contentPlan: string;
  leadSystemPlan: string;
};

type PortalLeadEntry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: PortalLeadSource;
  dateSubmitted: string;
  status: PortalLeadStatus;
  notes: string;
};

type PortalUpdate = {
  id: string;
  message: string;
  date: string;
};

type PortalProgressStep = {
  label: string;
  status: PortalStepStatus;
};

type PortalChecklistItem = {
  label: string;
  status: PortalTaskStatus;
};

type ClientProfile = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ClientStatus;
  input: ClientInput;
  outputs: ClientOutputs;
  tasks: string[];
  requestedAssets: string[];
  approvalChecklist: string[];
  notes: string;
  portal?: {
    id?: string;
    loginIdentifier: string;
    temporaryPassword: string;
    accessStatus: PortalAccessStatus;
    projectStatus: PortalProjectStatus;
    currentPhase: string;
    leads: PortalLeadEntry[];
    progress: PortalProgressStep[];
    tasks: PortalChecklistItem[];
    approvals: PortalChecklistItem[];
    updates: PortalUpdate[];
    lastPublishedAt?: string;
  };
};

type Props = {
  view: BuilderView;
  clientId?: string;
};

const STORAGE_KEY = "zentrixa-client-builder-v1";
const PORTAL_PROGRESS_STEPS = ["Onboarding", "Website Draft", "Content Plan", "Lead System Setup", "Launch", "Growth Tracking"];
const PORTAL_PROJECT_STATUSES: PortalProjectStatus[] = ["New", "Onboarding", "Website Build", "Content Setup", "Ads Setup", "Waiting for Client", "Live", "Completed"];
const PORTAL_STEP_STATUSES: PortalStepStatus[] = ["Not started", "In progress", "Waiting for client", "Completed"];
const PORTAL_TASK_STATUSES: PortalTaskStatus[] = ["Pending", "Submitted", "Approved"];
const PORTAL_LEAD_SOURCES: PortalLeadSource[] = ["Meta Form", "Website Form", "Instagram", "Manual"];
const PORTAL_LEAD_STATUSES: PortalLeadStatus[] = ["New", "Contacted", "Booked", "Closed"];

const emptyInput: ClientInput = {
  businessName: "",
  ownerName: "",
  industry: "",
  location: "",
  phone: "",
  email: "",
  website: "",
  instagram: "",
  servicesOffered: "",
  targetCustomers: "",
  mainGoal: "",
  currentProblems: "",
  uniqueSellingPoints: "",
  competitors: "",
  packageSelected: "Website Setup",
  projectType: "full system",
  brandColors: "",
  stylePreference: "",
  timeline: "5-7 days",
  discoveryNotes: ""
};

const emptyOutputs: ClientOutputs = {
  welcomeDocument: "",
  websitePlan: "",
  contentPlan: "",
  leadSystemPlan: ""
};

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `client-${Date.now()}`;
}

function generateFallback(input: ClientInput): ClientOutputs {
  const business = input.businessName || "the client";
  const owner = input.ownerName || "there";
  const industry = input.industry || "local business";
  const goal = input.mainGoal || "get more customers";
  const services = input.servicesOffered || "core services";

  return {
    welcomeDocument: `# Welcome to Zentrixa, ${owner}\n\nWe are excited to help ${business} build a cleaner system for growth.\n\n## Project summary\nZentrixa will handle the strategy, website direction, lead capture, follow-up structure, and launch support for your ${industry} business.\n\n## What we will handle\n- Website structure and conversion strategy\n- Lead capture setup\n- Content and growth direction\n- Follow-up workflow\n- Launch support and revisions\n\n## Timeline\nTarget timeline: ${input.timeline || "5-7 days"}.\n\n## What we need from you\n- Logo or brand assets\n- Service list and pricing notes\n- Photos or examples you like\n- Any must-have business details\n\n## Communication\nWe will keep everything direct, simple, and focused on getting your system live properly.\n\n## Next steps\nConfirm the plan, send requested assets, and we will begin the build.`,
    websitePlan: `# Website Plan for ${business}\n\n## Homepage structure\n1. Hero: clear promise around ${goal}\n2. Services: highlight ${services}\n3. Proof and trust: location, experience, reviews, before/after if available\n4. Offer: simple reason to contact now\n5. Lead capture: short form plus click-to-call\n6. Footer: phone, location, and simple CTA\n\n## Headline ideas\n- ${business} helps ${input.targetCustomers || "local customers"} get the right service faster.\n- Professional ${industry} services in ${input.location || "your area"}.\n\n## CTA strategy\nPrimary CTA: Call now. Secondary CTA: Request a quote.\n\n## Design direction\n${input.stylePreference || "Clean, premium, mobile-first, and easy to scan."}`,
    contentPlan: `# 30-Day Content Plan\n\n## Weekly rhythm\n- Week 1: Introduce the business, services, and trust points\n- Week 2: Show problems customers face and simple fixes\n- Week 3: Share proof, process, and behind-the-scenes content\n- Week 4: Push offer, FAQs, and direct CTA posts\n\n## Reel ideas\n- Common mistake customers make before hiring a ${industry}\n- Quick before/after or process clip\n- Why ${business} is different\n- FAQ answer in under 30 seconds\n\n## Caption hooks\n- "Most people do not realize..."\n- "If you are in ${input.location || "the area"}, this helps..."\n- "Here is what to check before booking..."\n\n## CTA suggestions\nCall today, request a quote, or send a message to get started.\n\n## Hashtags\n#${industry.replace(/\s+/g, "")} #${(input.location || "Ontario").replace(/\s+/g, "")}Business #LocalBusiness #Zentrixa`,
    leadSystemPlan: `# Lead System Plan\n\n## Capture\nLeads should come from the website form, phone calls, social profile clicks, and ad traffic if ads are included.\n\n## Follow-up\n- New lead: respond fast with a simple question\n- No answer: follow up within 24 hours\n- Interested: book a call or quote immediately\n- Not ready: set a reminder and follow up later\n\n## Suggested messages\n1. "Hey, thanks for reaching out to ${business}. What service are you looking for?"\n2. "Quick follow-up. Do you still need help with this?"\n3. "We can help with ${services}. Want to book a quick call?"\n\n## Tracking workflow\nTrack source, service needed, status, follow-up date, notes, and close outcome.`
  };
}

export function ClientBuilder({ view, clientId }: Props) {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<ClientInput>(emptyInput);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [portalLeadDraft, setPortalLeadDraft] = useState<Omit<PortalLeadEntry, "id" | "dateSubmitted">>({ name: "", phone: "", email: "", source: "Manual", status: "New", notes: "" });
  const [portalUpdateDraft, setPortalUpdateDraft] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setClients(JSON.parse(saved));
      } catch {
        setClients([]);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients, ready]);

  const selectedClient = clients.find((client) => client.id === clientId) ?? clients[0];
  const stats = useMemo(() => ({
    total: clients.length,
    active: clients.filter((client) => !["Completed"].includes(client.status)).length,
    waiting: clients.filter((client) => client.status === "Waiting for Client").length,
    completed: clients.filter((client) => client.status === "Completed").length
  }), [clients]);

  function updateInput(field: keyof ClientInput, value: string) {
    setInput((current) => ({ ...current, [field]: value }));
  }

  async function generateOutputs(data: ClientInput) {
    setGenerating(true);
    setMessage("");
    try {
      const response = await fetch("/api/client-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result?.ok && result.outputs) return result.outputs as ClientOutputs;
    } catch {
      // fallback below
    } finally {
      setGenerating(false);
    }
    return generateFallback(data);
  }

  async function createClient() {
    if (!input.businessName.trim()) {
      setMessage("Business name is required.");
      return;
    }
    const outputs = await generateOutputs(input);
    const profile: ClientProfile = {
      id: uid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "New",
      input,
      outputs,
      tasks: ["Confirm project details", "Collect assets", "Build first draft", "Review with client", "Launch"],
      requestedAssets: ["Logo", "Brand colors", "Service photos", "Business hours", "Service/pricing details"],
      approvalChecklist: ["Welcome document approved", "Website plan approved", "Content direction approved", "Lead follow-up approved"],
      notes: "",
      portal: {
        loginIdentifier: input.email || `${input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@client`,
        temporaryPassword: makeTempPassword(),
        accessStatus: "Active",
        projectStatus: "New",
        currentPhase: "Onboarding",
        leads: [],
        progress: makeDefaultProgress(),
        tasks: ["logo", "brand photos", "service list", "pricing", "business hours", "social media access", "ad account access", "domain access"].map((label) => ({ label, status: "Pending" })),
        approvals: ["Website copy approved", "Website design approved", "Content plan approved", "Ads setup approved", "Launch approved"].map((label) => ({ label, status: "Pending" })),
        updates: [{ id: uid(), message: "Client portal created.", date: new Date().toISOString().slice(0, 10) }]
      }
    };
    setClients((current) => [profile, ...current]);
    setInput(emptyInput);
    setStep(0);
    window.location.href = `/client-builder/clients/${profile.id}`;
  }

  async function regenerateSection(client: ClientProfile, section: keyof ClientOutputs) {
    const outputs = await generateOutputs(client.input);
    setClients((current) => current.map((item) => item.id === client.id ? {
      ...item,
      outputs: { ...item.outputs, [section]: outputs[section] },
      updatedAt: new Date().toISOString()
    } : item));
  }

  function updateClient(client: ClientProfile, patch: Partial<ClientProfile>) {
    setClients((current) => current.map((item) => item.id === client.id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item));
  }

  function updatePortal(client: ClientProfile, patch: Partial<NonNullable<ClientProfile["portal"]>>) {
    const currentPortal: NonNullable<ClientProfile["portal"]> = client.portal || {
      loginIdentifier: client.input.email || `${client.input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@client`,
      temporaryPassword: makeTempPassword(),
      accessStatus: "Active",
      projectStatus: "New",
      currentPhase: "Onboarding",
      leads: [],
      progress: makeDefaultProgress(),
      tasks: client.requestedAssets.map((label) => ({ label, status: "Pending" })),
      approvals: client.approvalChecklist.map((label) => ({ label, status: "Pending" })),
      updates: []
    };
    updateClient(client, { portal: { ...currentPortal, ...patch } });
  }

  function getPortal(client: ClientProfile): NonNullable<ClientProfile["portal"]> {
    const fallback: NonNullable<ClientProfile["portal"]> = {
      loginIdentifier: client.input.email || `${client.input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@client`,
      temporaryPassword: makeTempPassword(),
      accessStatus: "Active",
      projectStatus: "New",
      currentPhase: "Onboarding",
      leads: [],
      progress: makeDefaultProgress(),
      tasks: client.requestedAssets.map((label) => ({ label, status: "Pending" })),
      approvals: client.approvalChecklist.map((label) => ({ label, status: "Pending" })),
      updates: []
    };
    if (!client.portal) return fallback;
    return {
      ...fallback,
      ...client.portal,
      projectStatus: client.portal.projectStatus || fallback.projectStatus,
      progress: client.portal.progress?.length ? client.portal.progress : fallback.progress,
      tasks: client.portal.tasks?.length ? client.portal.tasks : fallback.tasks,
      approvals: client.portal.approvals?.length ? client.portal.approvals : fallback.approvals,
      leads: client.portal.leads || [],
      updates: client.portal.updates || []
    };
  }

  function portalData(client: ClientProfile) {
    const portal = getPortal(client);
    return {
      input: client.input,
      outputs: client.outputs,
      status: portal.projectStatus,
      packageSelected: client.input.packageSelected,
      currentPhase: portal.currentPhase || "Onboarding",
      startedAt: client.createdAt,
      leads: portal.leads,
      progress: portal.progress?.length ? portal.progress : makeDefaultProgress(),
      tasks: portal.tasks?.length ? portal.tasks : client.requestedAssets.map((label) => ({ label, status: "Pending" })),
      approvals: portal.approvals?.length ? portal.approvals : client.approvalChecklist.map((label) => ({ label, status: "Pending" })),
      updates: portal.updates
    };
  }

  async function publishPortal(client: ClientProfile, portalOverride?: NonNullable<ClientProfile["portal"]>) {
    const portal = portalOverride || getPortal(client);
    if (!portal.loginIdentifier) {
      setMessage("Add a client login email or username first.");
      return;
    }

    const response = await fetch("/api/client-portals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portalId: portal.id,
        businessName: client.input.businessName,
        loginIdentifier: portal.loginIdentifier,
        password: portal.temporaryPassword,
        accessStatus: portal.accessStatus,
        portalData: portalData({ ...client, portal })
      })
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.ok) {
      setMessage(result?.error || "Could not publish portal.");
      return;
    }

    updatePortal(client, { ...portal, id: result.portal.id, lastPublishedAt: new Date().toISOString() });
    setMessage("Client portal published.");
  }

  async function resetPortalPassword(client: ClientProfile) {
    const portal = { ...getPortal(client), temporaryPassword: makeTempPassword() };
    updatePortal(client, portal);
    await publishPortal(client, portal);
  }

  function updatePortalProgress(client: ClientProfile, index: number, status: PortalStepStatus) {
    const portal = getPortal(client);
    updatePortal(client, {
      progress: portal.progress.map((step, stepIndex) => stepIndex === index ? { ...step, status } : step)
    });
  }

  function updatePortalTask(client: ClientProfile, index: number, status: PortalTaskStatus) {
    const portal = getPortal(client);
    updatePortal(client, {
      tasks: portal.tasks.map((task, taskIndex) => taskIndex === index ? { ...task, status } : task)
    });
  }

  function updatePortalApproval(client: ClientProfile, index: number, status: PortalTaskStatus) {
    const portal = getPortal(client);
    updatePortal(client, {
      approvals: portal.approvals.map((approval, approvalIndex) => approvalIndex === index ? { ...approval, status } : approval)
    });
  }

  function addPortalLead(client: ClientProfile) {
    if (!portalLeadDraft.name.trim()) {
      setMessage("Lead name is required.");
      return;
    }
    const current = getPortal(client).leads;
    updatePortal(client, {
      leads: [{
        id: uid(),
        ...portalLeadDraft,
        dateSubmitted: new Date().toISOString().slice(0, 10)
      }, ...current]
    });
    setPortalLeadDraft({ name: "", phone: "", email: "", source: "Manual", status: "New", notes: "" });
  }

  function addPortalUpdate(client: ClientProfile) {
    if (!portalUpdateDraft.trim()) return;
    updatePortal(client, {
      updates: [{ id: uid(), message: portalUpdateDraft.trim(), date: new Date().toISOString().slice(0, 10) }, ...getPortal(client).updates]
    });
    setPortalUpdateDraft("");
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
    setMessage("Copied.");
  }

  function downloadMarkdown(client: ClientProfile) {
    const md = `# ${client.input.businessName} Onboarding Package\n\n${client.outputs.welcomeDocument}\n\n${client.outputs.websitePlan}\n\n${client.outputs.contentPlan}\n\n${client.outputs.leadSystemPlan}`;
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${client.input.businessName || "client"}-onboarding.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function makeTempPassword() {
    return `Zentrixa-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function makeDefaultProgress(): PortalProgressStep[] {
    return PORTAL_PROGRESS_STEPS.map((label, index) => ({
      label,
      status: index === 0 ? "In progress" : "Not started"
    }));
  }

  return (
    <main className={styles.root}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.back}>{"<- Zentrixa"}</Link>
        <nav>
          <Link href="/client-builder">Overview</Link>
          <Link href="/client-builder/new">New Client</Link>
          <Link href="/client-builder/clients">Clients</Link>
          <Link href="/app">LeadOS</Link>
        </nav>
      </header>

      {message ? <div className={styles.toast}>{message}</div> : null}

      {view === "home" ? (
        <>
          <section className={styles.hero}>
            <p className={styles.kicker}>Zentrixa Client Builder</p>
            <h1>Generate polished onboarding packages in minutes.</h1>
            <p>Input a business once. Get a welcome doc, website plan, content plan, lead system plan, and portal preview.</p>
            <div className={styles.actions}>
              <Link className={styles.primary} href="/client-builder/new">Build new client</Link>
              <Link className={styles.secondary} href="/client-builder/clients">View clients</Link>
            </div>
          </section>
          <section className={styles.metrics}>
            <Metric label="Saved clients" value={stats.total} />
            <Metric label="Active" value={stats.active} />
            <Metric label="Waiting" value={stats.waiting} />
            <Metric label="Completed" value={stats.completed} />
          </section>
          <ClientList clients={clients.slice(0, 4)} />
        </>
      ) : null}

      {view === "new" ? renderNewForm() : null}
      {view === "clients" ? <ClientList clients={clients} /> : null}
      {view === "detail" ? renderDetail(selectedClient) : null}
    </main>
  );

  function renderNewForm() {
    const steps = ["Client Info", "Business Details", "Project Details"];
    return (
      <section className={styles.panel}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.kicker}>New onboarding package</p>
            <h2>{steps[step]}</h2>
          </div>
          <span>Step {step + 1} of 3</span>
        </div>
        <div className={styles.stepTabs}>
          {steps.map((label, index) => <button key={label} className={index === step ? styles.activeTab : ""} type="button" onClick={() => setStep(index)}>{label}</button>)}
        </div>
        <div className={styles.formGrid}>
          {step === 0 ? (
            <>
              <Field label="Business Name" value={input.businessName} onChange={(value) => updateInput("businessName", value)} />
              <Field label="Owner Name" value={input.ownerName} onChange={(value) => updateInput("ownerName", value)} />
              <Field label="Industry" value={input.industry} onChange={(value) => updateInput("industry", value)} />
              <Field label="Location" value={input.location} onChange={(value) => updateInput("location", value)} />
              <Field label="Phone" value={input.phone} onChange={(value) => updateInput("phone", value)} />
              <Field label="Email" value={input.email} onChange={(value) => updateInput("email", value)} />
              <Field label="Website" value={input.website} onChange={(value) => updateInput("website", value)} />
              <Field label="Instagram" value={input.instagram} onChange={(value) => updateInput("instagram", value)} />
            </>
          ) : null}
          {step === 1 ? (
            <>
              <Area label="Services offered" value={input.servicesOffered} onChange={(value) => updateInput("servicesOffered", value)} />
              <Area label="Target customers" value={input.targetCustomers} onChange={(value) => updateInput("targetCustomers", value)} />
              <Area label="Main goal" value={input.mainGoal} onChange={(value) => updateInput("mainGoal", value)} />
              <Area label="Current problems" value={input.currentProblems} onChange={(value) => updateInput("currentProblems", value)} />
              <Area label="Unique selling points" value={input.uniqueSellingPoints} onChange={(value) => updateInput("uniqueSellingPoints", value)} />
              <Area label="Competitors" value={input.competitors} onChange={(value) => updateInput("competitors", value)} />
            </>
          ) : null}
          {step === 2 ? (
            <>
              <Field label="Package selected" value={input.packageSelected} onChange={(value) => updateInput("packageSelected", value)} />
              <Field label="Project type" value={input.projectType} onChange={(value) => updateInput("projectType", value)} />
              <Field label="Brand colors" value={input.brandColors} onChange={(value) => updateInput("brandColors", value)} />
              <Field label="Style preference" value={input.stylePreference} onChange={(value) => updateInput("stylePreference", value)} />
              <Field label="Timeline" value={input.timeline} onChange={(value) => updateInput("timeline", value)} />
              <Area label="Notes from discovery call" value={input.discoveryNotes} onChange={(value) => updateInput("discoveryNotes", value)} />
            </>
          ) : null}
        </div>
        <div className={styles.actions}>
          {step > 0 ? <button className={styles.secondary} type="button" onClick={() => setStep((value) => value - 1)}>Back</button> : null}
          {step < 2 ? <button className={styles.primary} type="button" onClick={() => setStep((value) => value + 1)}>Next</button> : <button className={styles.primary} type="button" onClick={createClient} disabled={generating}>{generating ? "Generating..." : "Generate package"}</button>}
        </div>
      </section>
    );
  }

  function renderDetail(client?: ClientProfile) {
    if (!client) return <section className={styles.empty}>No client found yet. Create your first onboarding package.</section>;
    const portal = getPortal(client);
    const portalUrl = portal.id ? `${typeof location !== "undefined" ? location.origin : ""}/client-portal/${portal.id}` : "";
    return (
      <section className={styles.detailGrid}>
        <aside className={styles.panel}>
          <p className={styles.kicker}>Portal preview</p>
          <h2>{client.input.businessName}</h2>
          <select className={styles.input} value={client.status} onChange={(event) => updateClient(client, { status: event.target.value as ClientStatus })}>
            {["New", "Onboarding", "In Progress", "Waiting for Client", "Completed"].map((status) => <option key={status}>{status}</option>)}
          </select>
          <div className={styles.infoList}>
            <span>Owner: {client.input.ownerName || "-"}</span>
            <span>Industry: {client.input.industry || "-"}</span>
            <span>Timeline: {client.input.timeline || "-"}</span>
            <span>Package: {client.input.packageSelected}</span>
          </div>
          <h3>Requested assets</h3>
          <Checklist items={client.requestedAssets} />
          <h3>Approval checklist</h3>
          <Checklist items={client.approvalChecklist} />
          <button className={styles.secondary} type="button" onClick={() => downloadMarkdown(client)}>Export markdown</button>
          <div className={styles.portalBox}>
            <p className={styles.kicker}>Client Login Access</p>
            <label className={styles.field}><span>Email or username</span><input value={portal.loginIdentifier} onChange={(event) => updatePortal(client, { loginIdentifier: event.target.value })} /></label>
            <label className={styles.field}><span>Temporary password</span><input value={portal.temporaryPassword} onChange={(event) => updatePortal(client, { temporaryPassword: event.target.value })} /></label>
            <select className={styles.input} value={portal.accessStatus} onChange={(event) => updatePortal(client, { accessStatus: event.target.value as PortalAccessStatus })}>
              <option>Active</option>
              <option>Disabled</option>
            </select>
            <SelectField label="Project status" value={portal.projectStatus} options={PORTAL_PROJECT_STATUSES} onChange={(value) => updatePortal(client, { projectStatus: value as PortalProjectStatus })} />
            <label className={styles.field}><span>Current phase</span><input value={portal.currentPhase} onChange={(event) => updatePortal(client, { currentPhase: event.target.value })} /></label>
            {portal.id ? <p className={styles.mutedLine}>Portal URL: {portalUrl}</p> : <p className={styles.mutedLine}>Publish once to create this client's private portal URL.</p>}
            {portal.lastPublishedAt ? <p className={styles.mutedLine}>Last published: {new Date(portal.lastPublishedAt).toLocaleString()}</p> : null}
            <div className={styles.actions}>
              <button className={styles.primary} type="button" onClick={() => publishPortal(client)}>Publish/update portal</button>
              <button className={styles.secondary} type="button" onClick={() => resetPortalPassword(client)}>Reset password</button>
              {portal.id ? <Link className={styles.secondary} href={`/client-portal/${portal.id}`}>Open portal</Link> : null}
              <button className={styles.secondary} type="button" onClick={() => copy(`Portal login: ${location.origin}/client-login\nLogin: ${portal.loginIdentifier}\nPassword: ${portal.temporaryPassword}${portalUrl ? `\nPortal URL: ${portalUrl}` : ""}`)}>Copy login details</button>
            </div>
          </div>
          <div className={styles.portalBox}>
            <p className={styles.kicker}>Manual Lead Entry</p>
            <div className={styles.miniStats}>
              <span><strong>{portal.leads.length}</strong> Leads</span>
              <span><strong>{portal.leads.filter((lead) => lead.source === "Website Form").length}</strong> Forms</span>
              <span><strong>{portal.leads.filter((lead) => lead.status === "Booked").length}</strong> Booked</span>
              <span><strong>{portal.leads.filter((lead) => lead.status === "Closed").length}</strong> Closed</span>
            </div>
            <div className={styles.formGrid}>
              <Field label="Lead name" value={portalLeadDraft.name} onChange={(value) => setPortalLeadDraft((draft) => ({ ...draft, name: value }))} />
              <Field label="Phone" value={portalLeadDraft.phone} onChange={(value) => setPortalLeadDraft((draft) => ({ ...draft, phone: value }))} />
              <Field label="Email" value={portalLeadDraft.email} onChange={(value) => setPortalLeadDraft((draft) => ({ ...draft, email: value }))} />
              <SelectField label="Source" value={portalLeadDraft.source} options={PORTAL_LEAD_SOURCES} onChange={(value) => setPortalLeadDraft((draft) => ({ ...draft, source: value as PortalLeadSource }))} />
              <SelectField label="Status" value={portalLeadDraft.status} options={PORTAL_LEAD_STATUSES} onChange={(value) => setPortalLeadDraft((draft) => ({ ...draft, status: value as PortalLeadStatus }))} />
              <Field label="Notes" value={portalLeadDraft.notes} onChange={(value) => setPortalLeadDraft((draft) => ({ ...draft, notes: value }))} />
            </div>
            <button className={styles.secondary} type="button" onClick={() => addPortalLead(client)}>Add lead to portal</button>
            <div className={styles.portalList}>
              {portal.leads.slice(0, 5).map((lead, index) => (
                <article key={lead.id || `${lead.name}-${index}`} className={styles.portalListItem}>
                  <strong>{lead.name}</strong>
                  <span>{lead.source} - {lead.status} - {lead.dateSubmitted}</span>
                </article>
              ))}
            </div>
          </div>
          <div className={styles.portalBox}>
            <p className={styles.kicker}>Project Progress</p>
            <div className={styles.portalList}>
              {portal.progress.map((step, index) => (
                <label key={step.label} className={styles.portalListItem}>
                  <strong>{index + 1}. {step.label}</strong>
                  <select value={step.status} onChange={(event) => updatePortalProgress(client, index, event.target.value as PortalStepStatus)}>
                    {PORTAL_STEP_STATUSES.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.portalBox}>
            <p className={styles.kicker}>Client Action Items</p>
            <div className={styles.portalList}>
              {portal.tasks.map((task, index) => (
                <label key={`${task.label}-${index}`} className={styles.portalListItem}>
                  <strong>{task.label}</strong>
                  <select value={task.status} onChange={(event) => updatePortalTask(client, index, event.target.value as PortalTaskStatus)}>
                    {PORTAL_TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.portalBox}>
            <p className={styles.kicker}>Approval Checklist</p>
            <div className={styles.portalList}>
              {portal.approvals.map((approval, index) => (
                <label key={`${approval.label}-${index}`} className={styles.portalListItem}>
                  <strong>{approval.label}</strong>
                  <select value={approval.status} onChange={(event) => updatePortalApproval(client, index, event.target.value as PortalTaskStatus)}>
                    {PORTAL_TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.portalBox}>
            <p className={styles.kicker}>Progress Updates</p>
            <label className={styles.field}><span>New update</span><input value={portalUpdateDraft} onChange={(event) => setPortalUpdateDraft(event.target.value)} placeholder="Website homepage draft started" /></label>
            <button className={styles.secondary} type="button" onClick={() => addPortalUpdate(client)}>Post update</button>
            <div className={styles.portalList}>
              {portal.updates.slice(0, 5).map((update, index) => (
                <article key={update.id || `${update.date}-${index}`} className={styles.portalListItem}>
                  <strong>{update.date}</strong>
                  <span>{update.message}</span>
                </article>
              ))}
            </div>
          </div>
        </aside>
        <div className={styles.stack}>
          <OutputCard title="Welcome Document" text={client.outputs.welcomeDocument} onCopy={copy} onRegenerate={() => regenerateSection(client, "welcomeDocument")} />
          <OutputCard title="Website Plan" text={client.outputs.websitePlan} onCopy={copy} onRegenerate={() => regenerateSection(client, "websitePlan")} />
          <OutputCard title="Content Plan" text={client.outputs.contentPlan} onCopy={copy} onRegenerate={() => regenerateSection(client, "contentPlan")} />
          <OutputCard title="Lead System Plan" text={client.outputs.leadSystemPlan} onCopy={copy} onRegenerate={() => regenerateSection(client, "leadSystemPlan")} />
        </div>
      </section>
    );
  }

  function ClientList({ clients }: { clients: ClientProfile[] }) {
    return (
      <section className={styles.clientGrid}>
        {clients.length ? clients.map((client) => (
          <Link key={client.id} className={styles.clientCard} href={`/client-builder/clients/${client.id}`}>
            <span>{client.status}</span>
            <h3>{client.input.businessName}</h3>
            <p>{client.input.industry || "Business"} - {client.input.location || "Location not set"}</p>
          </Link>
        )) : <div className={styles.empty}>No clients saved yet.</div>}
      </section>
    );
  }
}

function Metric({ label, value }: { label: string; value: number }) {
  return <article><strong>{value}</strong><span>{label}</span></article>;
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className={styles.field}><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className={styles.field}><span>{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select className={styles.input} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Checklist({ items }: { items: string[] }) {
  return <div className={styles.checklist}>{items.map((item) => <label key={item}><input type="checkbox" /> {item}</label>)}</div>;
}

function OutputCard({ title, text, onCopy, onRegenerate }: { title: string; text: string; onCopy: (text: string) => void; onRegenerate: () => void }) {
  return (
    <article className={styles.outputCard}>
      <div className={styles.sectionHead}>
        <h2>{title}</h2>
        <div className={styles.actions}>
          <button className={styles.secondary} type="button" onClick={() => onCopy(text)}>Copy</button>
          <button className={styles.secondary} type="button" onClick={onRegenerate}>Regenerate</button>
        </div>
      </div>
      <pre>{text}</pre>
    </article>
  );
}
