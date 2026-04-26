"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./client-builder.module.css";

type BuilderView = "home" | "new" | "clients" | "detail";
type ClientStatus = "New" | "Onboarding" | "In Progress" | "Waiting for Client" | "Completed";

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
};

type Props = {
  view: BuilderView;
  clientId?: string;
};

const STORAGE_KEY = "zentrixa-client-builder-v1";

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
      notes: ""
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
