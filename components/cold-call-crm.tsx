"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./cold-call-crm.module.css";

type LeadStatus = "In Progress" | "No Answer" | "Follow Up Booked" | "Not Interested" | "Closed";
type ScriptTab = "script1" | "script2" | "script3";
type OfferTemplate =
  | "First month free on any monthly plan"
  | "Free website audit before committing"
  | "$50 off website setup"
  | "Free content post included with setup"
  | "Custom";

type CallLogEntry = {
  id: string;
  timestamp: string;
  message: string;
};

type LeadCard = {
  id: string;
  companyName: string;
  contactName: string;
  phoneNumber: string;
  website: string;
  industry: string;
  dateAdded: string;
  lastCalled: string;
  lastModified: string;
  status: LeadStatus;
  followUpAt: string;
  callHistory: CallLogEntry[];
  notesHtml: string;
  notesPreview: string;
  customOffer: string;
  offerTemplate: OfferTemplate;
};

const STORAGE_KEY = "zentrixa-cold-call-crm-v1";
const DEFAULT_STATUS: LeadStatus = "In Progress";
const FILTERS: Array<LeadStatus | "All"> = [
  "All",
  "Not Interested",
  "Follow Up Booked",
  "Closed",
  "No Answer",
  "In Progress"
];

const STATUS_META: Record<LeadStatus, { tone: string; icon: string }> = {
  "Not Interested": { tone: "danger", icon: "🔴" },
  "Follow Up Booked": { tone: "warn", icon: "🟡" },
  Closed: { tone: "success", icon: "🟢" },
  "No Answer": { tone: "muted", icon: "⚪" },
  "In Progress": { tone: "info", icon: "🔵" }
};

const OFFER_TEMPLATES: Record<OfferTemplate, string> = {
  "First month free on any monthly plan": "First month free on any monthly plan",
  "Free website audit before committing": "Free website audit before committing",
  "$50 off website setup": "$50 off website setup",
  "Free content post included with setup": "Free content post included with setup",
  Custom: ""
};

const PRICING_PACKAGES = [
  {
    title: "Website Setup",
    price: "Starting at $299",
    points: [
      "Custom website design",
      "Mobile optimized",
      "Lead capture setup",
      "Built to convert visitors into customers"
    ]
  },
  {
    title: "Monthly Content & Growth",
    price: "From $79/month",
    points: [
      "Content creation",
      "Ongoing updates",
      "Performance-focused improvements"
    ]
  },
  {
    title: "Content + Ads Management",
    price: "From $150/month",
    points: [
      "Content creation",
      "Ad campaign setup & management (LeadOS powered)",
      "Optimization for better results"
    ]
  }
];

const SCRIPT_LIBRARY: Record<ScriptTab, { title: string; opener: string; branches: Array<{ heading: string; body: string }> }> = {
  script1: {
    title: "SCRIPT 1 — DIRECT & CONFIDENT",
    opener:
      "Hey [Name], this is [Your Name] from Zentrixa — we build websites and marketing systems for local businesses. Quick question — are you currently happy with how many customers your website is bringing in?",
    branches: [
      {
        heading: "If YES",
        body:
          "That's great. Out of curiosity, are you doing any content or ads to keep that consistent, or is it mostly word of mouth? -> pivot to content package"
      },
      {
        heading: "If NOT INTERESTED",
        body:
          "Totally fair. Can I ask — is it more that the timing's off, or you're just not looking at marketing right now? -> If timing: Got it, when would be a better time to revisit this? -> book follow up. If not looking: No worries at all, I'll send you a quick overview in case it's useful down the road — what's the best email?"
      },
      {
        heading: "If ALREADY HAVE A WEBSITE",
        body:
          "Perfect, we actually work with businesses that already have one — we focus on making it convert better and bring in leads. Is yours doing that right now?"
      },
      {
        heading: "If TOO BUSY",
        body:
          "I get it, I'll be quick — what if I sent you a 1-pager and we jumped on a 10-minute call this week?"
      },
      {
        heading: "If TOO EXPENSIVE",
        body:
          "I hear you. Our website setup starts at $299 and monthly plans from $79 — most clients make that back in one new customer. Want to see how it breaks down?"
      }
    ]
  },
  script2: {
    title: "SCRIPT 2 — CURIOUS & CONSULTATIVE",
    opener:
      "Hey [Name], I'm [Your Name] from Zentrixa — we help local businesses get more customers through their website and online presence. I'm curious — how are you currently getting most of your new clients?",
    branches: [
      {
        heading: "If REFERRALS / WORD OF MOUTH",
        body:
          "That's awesome — referrals are gold. Have you thought about building a system that brings in leads on top of that, so you're not relying on it?"
      },
      {
        heading: "If GOOGLE / ADS",
        body:
          "Nice, so you're already investing in traffic — are you happy with how that traffic converts once they hit your site?"
      },
      {
        heading: "If NOTHING / NOT SURE",
        body:
          "Got it, that's actually really common. A lot of businesses we work with were in the same spot — we built them a system that now brings in leads consistently. Worth a 10-minute chat?"
      },
      {
        heading: "If NOT INTERESTED",
        body:
          "No problem at all. What's holding you back if you don't mind me asking — is it budget, timing, or just not a priority? -> handle based on answer"
      },
      {
        heading: "If ALREADY HAVE SOMEONE",
        body:
          "Totally respect that. Are you happy with the results you're getting from them, or is there room to improve?"
      }
    ]
  },
  script3: {
    title: "SCRIPT 3 — SOFT & RAPPORT-FIRST",
    opener:
      "Hey [Name], hope I'm not catching you at a bad time — this is [Your Name] from Zentrixa. We work with local businesses in [City/Area] on their websites and getting more customers online. I actually came across [Company Name] and wanted to reach out personally.",
    branches: [
      {
        heading: "If OPEN / CURIOUS",
        body:
          "So tell me a bit about the business — how long have you been running it? -> listen -> That's great. Are you at a point where getting more customers consistently would make a difference?"
      },
      {
        heading: "If WHAT IS THIS ABOUT",
        body:
          "Of course — we help businesses like yours get a website that actually brings in leads, plus we handle the content and follow-up system. Takes the whole thing off your plate."
      },
      {
        heading: "If NOT INTERESTED",
        body:
          "Totally get it, I appreciate you picking up. Is it cool if I shoot you a quick text with what we do — just so you have it if things change down the road?"
      },
      {
        heading: "If TOO BUSY",
        body:
          "Say no more — when's a better time this week? I only need 10 minutes, I'll make it worth it."
      },
      {
        heading: "If ALREADY HAVE A WEBSITE",
        body:
          "Love that — is it bringing in new customers regularly, or is it more just sitting there? -> if sitting there: That's exactly what we fix."
      }
    ]
  }
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPreview(value: string) {
  const plain = stripHtml(value);
  return plain.length > 110 ? `${plain.slice(0, 107)}...` : plain;
}

function createEmptyLead(): LeadCard {
  const createdAt = nowIso();
  return {
    id: createId("lead"),
    companyName: "",
    contactName: "",
    phoneNumber: "",
    website: "",
    industry: "",
    dateAdded: createdAt,
    lastCalled: "",
    lastModified: createdAt,
    status: DEFAULT_STATUS,
    followUpAt: "",
    callHistory: [
      {
        id: createId("log"),
        timestamp: createdAt,
        message: "Lead card created."
      }
    ],
    notesHtml: "",
    notesPreview: "",
    customOffer: "",
    offerTemplate: "Custom"
  };
}

const INITIAL_SECTIONS = {
  company: true,
  outcome: true,
  scripts: true,
  pricing: true,
  offer: true,
  notes: true
};

export function ColdCallCRM() {
  const [leads, setLeads] = useState<LeadCard[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LeadStatus | "All">("All");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [draftLead, setDraftLead] = useState<LeadCard>(() => createEmptyLead());
  const [activeScriptTab, setActiveScriptTab] = useState<ScriptTab>("script1");
  const [savedStamp, setSavedStamp] = useState("Saved");
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const notesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LeadCard[];
        if (Array.isArray(parsed)) {
          setLeads(parsed);
          setSelectedLeadId(parsed[0]?.id ?? "");
        }
      }
    } catch {
      // ignore malformed local data
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    setSavedStamp(`Saved ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
  }, [leads, hydrated]);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId]
  );

  useEffect(() => {
    if (notesRef.current && selectedLead) {
      notesRef.current.innerHTML = selectedLead.notesHtml || "";
    }
  }, [selectedLeadId, selectedLead?.notesHtml, hydrated]);

  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => (filter === "All" ? true : lead.status === filter))
      .filter((lead) => lead.companyName.toLowerCase().includes(query.toLowerCase()));
  }, [filter, leads, query]);

  function updateLead(id: string, updater: (lead: LeadCard) => LeadCard) {
    setLeads((current) => current.map((lead) => (lead.id === id ? updater(lead) : lead)));
  }

  function updateSelectedField<K extends keyof LeadCard>(field: K, value: LeadCard[K]) {
    if (!selectedLead) return;
    updateLead(selectedLead.id, (lead) => ({
      ...lead,
      [field]: value,
      lastModified: nowIso()
    }));
  }

  function handleCreateLead() {
    if (!draftLead.companyName.trim()) return;
    const created = {
      ...draftLead,
      companyName: draftLead.companyName.trim(),
      contactName: draftLead.contactName.trim(),
      website: draftLead.website.trim(),
      industry: draftLead.industry.trim(),
      lastModified: nowIso()
    };
    setLeads((current) => [created, ...current]);
    setSelectedLeadId(created.id);
    setShowCreate(false);
    setDraftLead(createEmptyLead());
    setSections(INITIAL_SECTIONS);
    setActiveScriptTab("script1");
  }

  function handleDeleteLead(id: string) {
    const lead = leads.find((item) => item.id === id);
    if (!lead) return;
    if (!window.confirm(`Delete ${lead.companyName || "this cold call card"}?`)) return;
    setLeads((current) => current.filter((item) => item.id !== id));
    if (selectedLeadId === id) {
      const remaining = leads.filter((item) => item.id !== id);
      setSelectedLeadId(remaining[0]?.id ?? "");
    }
  }

  function handleStatusChange(nextStatus: LeadStatus) {
    if (!selectedLead || nextStatus === selectedLead.status) return;
    const timestamp = nowIso();
    updateLead(selectedLead.id, (lead) => ({
      ...lead,
      status: nextStatus,
      lastCalled: timestamp,
      lastModified: timestamp,
      callHistory: [
        {
          id: createId("log"),
          timestamp,
          message: `Status changed from ${lead.status} to ${nextStatus}.`
        },
        ...lead.callHistory
      ]
    }));
  }

  function handleFollowUpChange(value: string) {
    if (!selectedLead) return;
    updateLead(selectedLead.id, (lead) => ({
      ...lead,
      followUpAt: value,
      lastModified: nowIso(),
      callHistory: value
        ? [
            {
              id: createId("log"),
              timestamp: nowIso(),
              message: `Follow-up booked for ${formatDate(value)}.`
            },
            ...lead.callHistory
          ]
        : lead.callHistory
    }));
  }

  function applyOfferTemplate(value: OfferTemplate) {
    if (!selectedLead) return;
    updateLead(selectedLead.id, (lead) => ({
      ...lead,
      offerTemplate: value,
      customOffer: value === "Custom" ? lead.customOffer : OFFER_TEMPLATES[value],
      lastModified: nowIso()
    }));
  }

  function toggleSection(section: keyof typeof INITIAL_SECTIONS) {
    setSections((current) => ({ ...current, [section]: !current[section] }));
  }

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    notesRef.current?.focus();
  }

  function handleNotesInput() {
    if (!selectedLead || !notesRef.current) return;
    const html = notesRef.current.innerHTML;
    updateLead(selectedLead.id, (lead) => ({
      ...lead,
      notesHtml: html,
      notesPreview: buildPreview(html),
      lastModified: nowIso()
    }));
  }

  function insertChecklist() {
    exec(
      "insertHTML",
      `<label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" /> checklist item</label>`
    );
    handleNotesInput();
  }

  function insertDivider() {
    exec("insertHorizontalRule");
    handleNotesInput();
  }

  function clearFormatting() {
    exec("removeFormat");
    exec("formatBlock", "p");
    handleNotesInput();
  }

  const scriptContent = selectedLead
    ? SCRIPT_LIBRARY[activeScriptTab]
    : SCRIPT_LIBRARY.script1;

  function personalize(text: string) {
    if (!selectedLead) return text;
    return text
      .replaceAll("[Name]", selectedLead.contactName || "there")
      .replaceAll("[Your Name]", "Idrees")
      .replaceAll("[Company Name]", selectedLead.companyName || "your business")
      .replaceAll("[City/Area]", "Ontario");
  }

  return (
    <div className={styles.shell}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Zentrixa Cold Call CRM</p>
            <h1 className={styles.title}>Track every call, script, offer, and follow-up from one place.</h1>
          </div>
          <button className={styles.createButton} type="button" onClick={() => setShowCreate(true)} aria-label="Create new cold call card">
            +
          </button>
        </header>

        <div className={styles.workspace}>
          <aside className={`${styles.dashboard} ${selectedLead ? styles.dashboardWithDetail : ""}`}>
            <div className={styles.dashboardBar}>
              <input
                className={styles.search}
                placeholder="Search by company name"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className={styles.filterBar}>
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`${styles.filterChip} ${filter === item ? styles.filterChipActive : ""}`}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {!hydrated ? (
              <div className={styles.emptyState}>Loading cold call cards…</div>
            ) : filteredLeads.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyPlus}>+</div>
                <h2>{leads.length === 0 ? "No cold call cards yet" : "No matching leads"}</h2>
                <p>
                  {leads.length === 0
                    ? "Create your first cold call card to start tracking scripts, outcomes, offers, and notes."
                    : "Try a different search or status filter."}
                </p>
                {leads.length === 0 ? (
                  <button className={styles.primaryAction} type="button" onClick={() => setShowCreate(true)}>
                    Create your first card
                  </button>
                ) : null}
              </div>
            ) : (
              <div className={styles.cardGrid}>
                {filteredLeads.map((lead) => (
                  <article
                    key={lead.id}
                    className={`${styles.leadCard} ${selectedLeadId === lead.id ? styles.leadCardActive : ""}`}
                  >
                    <button type="button" className={styles.deleteCard} onClick={() => handleDeleteLead(lead.id)}>
                      ×
                    </button>
                    <button type="button" className={styles.cardBody} onClick={() => setSelectedLeadId(lead.id)}>
                      <div className={styles.cardTop}>
                        <h3>{lead.companyName || "Untitled lead"}</h3>
                        <span className={`${styles.statusBadge} ${styles[STATUS_META[lead.status].tone]}`}>
                          {STATUS_META[lead.status].icon} {lead.status}
                        </span>
                      </div>
                      <div className={styles.cardMeta}>
                        <span>Last modified {formatDate(lead.lastModified)}</span>
                        <span>{lead.industry || "Industry not set"}</span>
                      </div>
                      <p>{lead.notesPreview || "No notes yet. Open the card to add call notes and script context."}</p>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </aside>

          <section className={styles.detailPane}>
            {selectedLead ? (
              <>
                <div className={styles.detailHeader}>
                  <button type="button" className={styles.backButton} onClick={() => setSelectedLeadId("")}>
                    Dashboard
                  </button>
                  <div>
                    <p className={styles.eyebrow}>Lead Detail</p>
                    <h2>{selectedLead.companyName}</h2>
                  </div>
                  <span className={styles.savedPill}>{savedStamp}</span>
                </div>

                <DetailSection
                  title="Company Info"
                  open={sections.company}
                  onToggle={() => toggleSection("company")}
                >
                  <div className={styles.formGrid}>
                    <Field label="Company Name" value={selectedLead.companyName} onChange={(value) => updateSelectedField("companyName", value)} />
                    <Field label="Contact Name" value={selectedLead.contactName} onChange={(value) => updateSelectedField("contactName", value)} />
                    <Field label="Phone Number" value={selectedLead.phoneNumber} onChange={(value) => updateSelectedField("phoneNumber", value)} />
                    <Field label="Website" value={selectedLead.website} onChange={(value) => updateSelectedField("website", value)} />
                    <Field label="Industry" value={selectedLead.industry} onChange={(value) => updateSelectedField("industry", value)} />
                    <ReadOnlyField label="Date Added" value={formatDate(selectedLead.dateAdded)} />
                    <ReadOnlyField label="Last Called" value={formatDate(selectedLead.lastCalled)} />
                  </div>
                </DetailSection>

                <DetailSection
                  title="Call Outcome Tracker"
                  open={sections.outcome}
                  onToggle={() => toggleSection("outcome")}
                >
                  <div className={styles.statusGrid}>
                    {(Object.keys(STATUS_META) as LeadStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`${styles.statusOption} ${styles[STATUS_META[status].tone]} ${selectedLead.status === status ? styles.statusOptionActive : ""}`}
                        onClick={() => handleStatusChange(status)}
                      >
                        {STATUS_META[status].icon} {status}
                      </button>
                    ))}
                  </div>

                  {selectedLead.status === "Follow Up Booked" ? (
                    <label className={styles.inlineField}>
                      <span>Follow-up date and time</span>
                      <input
                        type="datetime-local"
                        value={selectedLead.followUpAt}
                        onChange={(event) => handleFollowUpChange(event.target.value)}
                      />
                    </label>
                  ) : null}

                  <div className={styles.logList}>
                    {selectedLead.callHistory.map((entry) => (
                      <div key={entry.id} className={styles.logItem}>
                        <strong>{formatDate(entry.timestamp)}</strong>
                        <span>{entry.message}</span>
                      </div>
                    ))}
                  </div>
                </DetailSection>

                <DetailSection
                  title="Scripts Section"
                  open={sections.scripts}
                  onToggle={() => toggleSection("scripts")}
                >
                  <div className={styles.tabBar}>
                    {(["script1", "script2", "script3"] as ScriptTab[]).map((tab, index) => (
                      <button
                        key={tab}
                        type="button"
                        className={`${styles.tab} ${activeScriptTab === tab ? styles.tabActive : ""}`}
                        onClick={() => setActiveScriptTab(tab)}
                      >
                        Script {index + 1}
                      </button>
                    ))}
                  </div>
                  <div className={styles.scriptPanel}>
                    <p className={styles.scriptTitle}>{scriptContent.title}</p>
                    <div className={styles.scriptOpener}>{personalize(scriptContent.opener)}</div>
                    <div className={styles.branchList}>
                      {scriptContent.branches.map((branch) => (
                        <article key={branch.heading} className={styles.branchCard}>
                          <h4>{branch.heading}</h4>
                          <p>{personalize(branch.body)}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </DetailSection>

                <DetailSection
                  title="Pricing Reference"
                  open={sections.pricing}
                  onToggle={() => toggleSection("pricing")}
                >
                  <div className={styles.pricingGrid}>
                    {PRICING_PACKAGES.map((item) => (
                      <article key={item.title} className={styles.pricingCard}>
                        <strong>{item.title}</strong>
                        <span>{item.price}</span>
                        <ul>
                          {item.points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                  <p className={styles.pricingNote}>
                    LeadOS: Mention as a competitive advantage — we use LeadOS for ad management which competitors do not have.
                  </p>
                </DetailSection>

                <DetailSection
                  title="Custom Offer Builder"
                  open={sections.offer}
                  onToggle={() => toggleSection("offer")}
                >
                  <div className={styles.offerGrid}>
                    <label className={styles.inlineField}>
                      <span>Quick insert template</span>
                      <select
                        value={selectedLead.offerTemplate}
                        onChange={(event) => applyOfferTemplate(event.target.value as OfferTemplate)}
                      >
                        {Object.keys(OFFER_TEMPLATES).map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.inlineField}>
                      <span>Editable custom offer</span>
                      <textarea
                        rows={5}
                        value={selectedLead.customOffer}
                        onChange={(event) => updateSelectedField("customOffer", event.target.value)}
                        placeholder="Write the exact offer you want to pitch this lead."
                      />
                    </label>
                  </div>
                </DetailSection>

                <DetailSection
                  title="Notes Section"
                  open={sections.notes}
                  onToggle={() => toggleSection("notes")}
                >
                  <div className={styles.notesToolbar}>
                    <button type="button" onClick={() => exec("bold")}>B</button>
                    <button type="button" onClick={() => exec("italic")}>I</button>
                    <button type="button" onClick={() => exec("underline")}>U</button>
                    <button type="button" onClick={() => exec("insertUnorderedList")}>• List</button>
                    <button type="button" onClick={() => exec("insertOrderedList")}>1. List</button>
                    <button type="button" onClick={() => exec("formatBlock", "<h1>")}>H1</button>
                    <button type="button" onClick={() => exec("formatBlock", "<h2>")}>H2</button>
                    <button type="button" onClick={() => exec("formatBlock", "<h3>")}>H3</button>
                    <button type="button" onClick={() => exec("hiliteColor", "yellow")}>Highlight</button>
                    <button type="button" onClick={insertDivider}>Divider</button>
                    <button type="button" onClick={insertChecklist}>Checklist</button>
                    <button type="button" onClick={() => exec("foreColor", "#f0f4f6")}>White</button>
                    <button type="button" onClick={() => exec("foreColor", "#ff5c80")}>Red</button>
                    <button type="button" onClick={() => exec("foreColor", "#58d68d")}>Green</button>
                    <button type="button" onClick={() => exec("foreColor", "#ffd166")}>Yellow</button>
                    <button type="button" onClick={() => exec("foreColor", "#8b94a7")}>Grey</button>
                    <button type="button" onClick={clearFormatting}>Clear</button>
                  </div>
                  <div className={styles.notesMeta}>Auto-saves on every keystroke. {savedStamp}</div>
                  <div
                    ref={notesRef}
                    className={styles.notesEditor}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleNotesInput}
                  />
                </DetailSection>
              </>
            ) : (
              <div className={styles.placeholder}>
                <h2>Select a cold call card</h2>
                <p>Open any lead from the dashboard to review scripts, track outcomes, write notes, and build a custom offer.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {showCreate ? (
        <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>New Cold Call Card</p>
                <h2>Create a new lead</h2>
              </div>
              <button type="button" className={styles.closeModal} onClick={() => setShowCreate(false)}>
                ×
              </button>
            </div>
            <div className={styles.formGrid}>
              <Field label="Company Name" value={draftLead.companyName} onChange={(value) => setDraftLead((current) => ({ ...current, companyName: value }))} />
              <Field label="Contact Name" value={draftLead.contactName} onChange={(value) => setDraftLead((current) => ({ ...current, contactName: value }))} />
              <Field label="Phone Number" value={draftLead.phoneNumber} onChange={(value) => setDraftLead((current) => ({ ...current, phoneNumber: value }))} />
              <Field label="Website" value={draftLead.website} onChange={(value) => setDraftLead((current) => ({ ...current, website: value }))} />
              <Field label="Industry" value={draftLead.industry} onChange={(value) => setDraftLead((current) => ({ ...current, industry: value }))} />
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryAction} onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button type="button" className={styles.primaryAction} onClick={handleCreateLead}>
                Create card
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className={styles.inlineField}>
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.inlineField}>
      <span>{label}</span>
      <div className={styles.readOnlyValue}>{value}</div>
    </div>
  );
}

function DetailSection({
  title,
  open,
  onToggle,
  children
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <button type="button" className={styles.sectionToggle} onClick={onToggle}>
        <span>{title}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open ? <div className={styles.sectionBody}>{children}</div> : null}
    </section>
  );
}
