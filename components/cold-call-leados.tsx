"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./cold-call-leados.module.css";

type WebsiteStatus = "No Website" | "Website Down" | "Website Expired" | "Weak Website" | "Has Website" | "Unknown";
type Priority = "Hot" | "Warm" | "Cold" | "Follow-up Due" | "Not Contacted" | "Bad Fit";
type CallStatus =
  | "Not Called"
  | "Called - No Answer"
  | "Called - Interested"
  | "Called - Not Interested"
  | "Voicemail Left"
  | "Call Back Later"
  | "Wrong Number"
  | "Booked Meeting"
  | "Closed"
  | "Do Not Contact";

type PipelineStage =
  | "New Lead"
  | "Need to Call"
  | "Contacted"
  | "Follow-Up"
  | "Interested"
  | "Meeting Booked"
  | "Proposal Sent"
  | "Closed Won"
  | "Closed Lost"
  | "Not Fit";

type CallAttempt = {
  id: string;
  at: string;
  outcome: CallStatus;
  notes: string;
  nextAction: string;
  followUpDate?: string;
  scriptUsed: string;
  objection?: string;
};

type Lead = {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  category: string;
  address: string;
  street: string;
  city: string;
  postalCode: string;
  state: string;
  countryCode: string;
  latitude: string;
  longitude: string;
  plusCode: string;
  googleRating: number;
  reviewCount: number;
  websiteStatus: WebsiteStatus;
  websiteUrl: string;
  socialUrl: string;
  source: string;
  score: number;
  priority: Priority;
  callStatus: CallStatus;
  stage: PipelineStage;
  lastContactedDate: string;
  nextFollowUpDate: string;
  notes: string;
  objections: string[];
  interestLevel: "High" | "Medium" | "Low" | "Unknown";
  servicesRecommended: string[];
  estimatedDealValue: number;
  tags: string[];
  callHistory: CallAttempt[];
  updatedAt: string;
};

type ColdCallView =
  | "dashboard"
  | "leads"
  | "detail"
  | "call-queue"
  | "pipeline"
  | "scripts"
  | "follow-ups"
  | "analytics"
  | "settings";

type Props = {
  view: ColdCallView;
  leadId?: string;
};

const STORAGE_KEY = "zentrixa-leados-cold-call-v1";
const SETTINGS_KEY = "zentrixa-leados-cold-call-settings-v1";
const today = new Date().toISOString().slice(0, 10);

type LeadOSSettings = {
  preCallLockEnabled: boolean;
  breathingCycles: number;
  sessionTimerEnabled: boolean;
  sessionMinutes: number;
  defaultScript: "Expired website" | "No website" | "Weak website" | "General cold call";
};

const defaultSettings: LeadOSSettings = {
  preCallLockEnabled: true,
  breathingCycles: 3,
  sessionTimerEnabled: true,
  sessionMinutes: 25,
  defaultScript: "General cold call"
};

const stages: PipelineStage[] = [
  "New Lead",
  "Need to Call",
  "Contacted",
  "Follow-Up",
  "Interested",
  "Meeting Booked",
  "Proposal Sent",
  "Closed Won",
  "Closed Lost",
  "Not Fit"
];

const callStatuses: CallStatus[] = [
  "Not Called",
  "Called - No Answer",
  "Called - Interested",
  "Called - Not Interested",
  "Voicemail Left",
  "Call Back Later",
  "Wrong Number",
  "Booked Meeting",
  "Closed",
  "Do Not Contact"
];

const scriptLibrary = [
  {
    category: "Expired website",
    title: "Website down opener",
    body:
      "Hey - I just checked your website and it looks like it is down. That usually means you are missing customers. I help businesses fix this quickly and set it up properly. Want me to take a look?"
  },
  {
    category: "No website",
    title: "Missing website opener",
    body:
      "Hey, this is Zentrixa. I noticed your business has strong local presence but I could not find a proper website. We build simple systems that turn calls, searches, and visitors into customers. Is getting more customers something you are focused on right now?"
  },
  {
    category: "Weak website",
    title: "Conversion audit opener",
    body:
      "I was looking at your website and there are a few quick wins that could help more visitors turn into calls. We handle the website, capture, and follow-up side so you do not need to manage the tech. Worth a quick look?"
  },
  {
    category: "Follow-up",
    title: "Callback opener",
    body:
      "Hey, following up from our last call. You mentioned the timing was tight, so I wanted to reconnect and see if improving your website and lead capture is still worth looking at this week."
  },
  {
    category: "Objections",
    title: "Price response",
    body:
      "Totally fair. The goal is not to spend more for no reason - it is to build a system that can pay for itself from new customers. Website setup starts at $299 and monthly growth starts at $79."
  }
];

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `lead-${Date.now()}-${Math.random()}`;
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isDue(date: string) {
  if (!date) return false;
  return new Date(date).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0);
}

function computeScore(lead: Partial<Lead>) {
  let score = 35;
  if (lead.websiteStatus === "No Website") score += 25;
  if (lead.websiteStatus === "Website Down" || lead.websiteStatus === "Website Expired") score += 30;
  if (lead.websiteStatus === "Weak Website") score += 18;
  if ((lead.reviewCount ?? 0) >= 100) score += 12;
  if ((lead.reviewCount ?? 0) >= 40) score += 8;
  if ((lead.googleRating ?? 5) < 4 && (lead.reviewCount ?? 0) >= 30) score += 8;
  if (["Contractor", "Landscaper", "Dental", "Restaurant", "Barber", "Auto Repair"].includes(lead.category ?? "")) score += 6;
  if (!lead.lastContactedDate) score += 7;
  if (lead.nextFollowUpDate && isDue(lead.nextFollowUpDate)) score += 10;
  if (lead.callStatus === "Called - Not Interested" || lead.callStatus === "Do Not Contact") score -= 25;
  if (lead.callStatus === "Booked Meeting") score += 20;
  return Math.max(0, Math.min(100, score));
}

function computePriority(lead: Partial<Lead>): Priority {
  if (lead.callStatus === "Do Not Contact" || lead.stage === "Not Fit") return "Bad Fit";
  if (lead.nextFollowUpDate && isDue(lead.nextFollowUpDate)) return "Follow-up Due";
  if (!lead.lastContactedDate || lead.callStatus === "Not Called") return "Not Contacted";
  const score = lead.score ?? computeScore(lead);
  if (score >= 80) return "Hot";
  if (score >= 58) return "Warm";
  return "Cold";
}

function normalizeLead(lead: Partial<Lead>): Lead {
  const normalized = {
    id: lead.id ?? uid(),
    businessName: lead.businessName ?? "Untitled business",
    contactName: lead.contactName ?? "",
    phone: lead.phone ?? "",
    email: lead.email ?? "",
    category: lead.category ?? "Local Business",
    address: lead.address ?? "",
    street: lead.street ?? "",
    city: lead.city ?? "Ontario",
    postalCode: lead.postalCode ?? "",
    state: lead.state ?? "",
    countryCode: lead.countryCode ?? "",
    latitude: lead.latitude ?? "",
    longitude: lead.longitude ?? "",
    plusCode: lead.plusCode ?? "",
    googleRating: Number(lead.googleRating ?? 0),
    reviewCount: Number(lead.reviewCount ?? 0),
    websiteStatus: lead.websiteStatus ?? "Unknown",
    websiteUrl: lead.websiteUrl ?? "",
    socialUrl: lead.socialUrl ?? "",
    source: lead.source ?? "CSV Import",
    score: 0,
    priority: "Cold" as Priority,
    callStatus: lead.callStatus ?? "Not Called",
    stage: lead.stage ?? "Need to Call",
    lastContactedDate: lead.lastContactedDate ?? "",
    nextFollowUpDate: lead.nextFollowUpDate ?? "",
    notes: lead.notes ?? "",
    objections: lead.objections ?? [],
    interestLevel: lead.interestLevel ?? "Unknown",
    servicesRecommended: lead.servicesRecommended ?? [],
    estimatedDealValue: Number(lead.estimatedDealValue ?? 299),
    tags: lead.tags ?? [],
    callHistory: lead.callHistory ?? [],
    updatedAt: lead.updatedAt ?? new Date().toISOString()
  };
  normalized.score = computeScore(normalized);
  normalized.priority = computePriority(normalized);
  normalized.tags = buildTags(normalized);
  return normalized;
}

function buildTags(lead: Lead) {
  const tags = new Set(lead.tags);
  if (lead.websiteStatus === "No Website") tags.add("No Website");
  if (lead.websiteStatus === "Weak Website") tags.add("Weak Website");
  if (lead.callStatus === "Called - Not Interested") tags.add("Not Interested");
  if (lead.callStatus === "Call Back Later") tags.add("Call Back");
  if (lead.priority === "Hot") tags.add("Hot Lead");
  if (lead.objections.some((item) => item.toLowerCase().includes("price"))) tags.add("Price Sensitive");
  return Array.from(tags).slice(0, 6);
}

const seedLeads: Lead[] = [
  normalizeLead({
    businessName: "Louch Landscapes",
    contactName: "Owner",
    phone: "(647) 206-4711",
    email: "",
    category: "Landscaper",
    address: "154 McWilliams Cres",
    city: "Oakville",
    googleRating: 5,
    reviewCount: 44,
    websiteStatus: "Weak Website",
    websiteUrl: "https://louchlandscapes.ca",
    source: "Google Maps",
    notes: "Good local reviews. Pitch a cleaner website and follow-up system before spring demand peaks.",
    servicesRecommended: ["Website Setup", "Monthly Content & Growth"],
    estimatedDealValue: 450
  }),
  normalizeLead({
    businessName: "Northline Auto Detail",
    contactName: "Manager",
    phone: "(905) 555-0187",
    category: "Auto Repair",
    city: "Mississauga",
    googleRating: 4.2,
    reviewCount: 128,
    websiteStatus: "No Website",
    source: "CSV Import",
    servicesRecommended: ["Website Setup", "Content + Ads Management"],
    estimatedDealValue: 599
  }),
  normalizeLead({
    businessName: "Harbour Dental Studio",
    contactName: "Reception",
    phone: "(289) 555-0134",
    category: "Dental",
    city: "Burlington",
    googleRating: 3.8,
    reviewCount: 91,
    websiteStatus: "Website Expired",
    callStatus: "Call Back Later",
    stage: "Follow-Up",
    lastContactedDate: addDays(-5),
    nextFollowUpDate: today,
    objections: ["Busy this week"],
    notes: "Asked for a callback after checking schedule.",
    servicesRecommended: ["Website Setup"],
    estimatedDealValue: 399
  })
];

function summarizeLead(lead: Lead) {
  const last = lead.callHistory[0];
  if (last) {
    return `Last call: ${last.outcome}. Main angle: ${lead.websiteStatus.toLowerCase()}. Next: ${last.nextAction}`;
  }
  return `${lead.businessName} is a ${lead.category.toLowerCase()} lead in ${lead.city}. Website status is ${lead.websiteStatus.toLowerCase()} with ${lead.reviewCount} reviews.`;
}

function pitchAngle(lead: Lead) {
  if (lead.websiteStatus === "No Website") return "Lead with no website: sell a simple customer capture system and fast setup.";
  if (lead.websiteStatus === "Website Down" || lead.websiteStatus === "Website Expired") {
    return "Urgent website issue: lead with lost traffic risk. Open with the site problem.";
  }
  if (lead.websiteStatus === "Weak Website") return "Website exists but needs conversion work. Pitch stronger layout, content, and follow-up.";
  return "General growth angle: show how Zentrixa can turn attention into booked customers.";
}

function followUpNote(lead: Lead, outcome: CallStatus) {
  if (outcome === "Called - No Answer") return `No answer from ${lead.businessName}. Try again tomorrow with a shorter opener.`;
  if (outcome === "Called - Interested") return `Interested conversation. Follow up with ${lead.servicesRecommended[0] ?? "Website Setup"} and keep the next step specific.`;
  if (outcome === "Call Back Later") return `Call back later. Re-open with: "You asked me to follow up about getting more customers from your website."`;
  if (outcome === "Called - Not Interested") return "Not interested right now. Lower priority unless a clear timing objection was mentioned.";
  if (outcome === "Booked Meeting") return "Meeting booked. Prep offer, website notes, and recommended package before the call.";
  return "Log completed. Review lead before the next action.";
}

function nextActionFor(outcome: CallStatus) {
  if (outcome === "Called - No Answer") return "Call again tomorrow";
  if (outcome === "Voicemail Left") return "Follow up in 2 days";
  if (outcome === "Called - Interested") return "Book meeting or send offer today";
  if (outcome === "Call Back Later") return "Call back in 3 days";
  if (outcome === "Booked Meeting") return "Prepare meeting notes";
  if (outcome === "Closed") return "Move to closed won";
  if (outcome === "Called - Not Interested") return "Archive or follow up next month";
  return "Review next best step";
}

function followUpDateFor(outcome: CallStatus) {
  if (outcome === "Called - No Answer") return addDays(1);
  if (outcome === "Voicemail Left") return addDays(2);
  if (outcome === "Call Back Later") return addDays(3);
  if (outcome === "Called - Interested") return today;
  if (outcome === "Booked Meeting" || outcome === "Closed" || outcome === "Do Not Contact") return "";
  return addDays(7);
}

function stageForOutcome(outcome: CallStatus): PipelineStage {
  if (outcome === "Called - Interested") return "Interested";
  if (outcome === "Call Back Later" || outcome === "Voicemail Left" || outcome === "Called - No Answer") return "Follow-Up";
  if (outcome === "Booked Meeting") return "Meeting Booked";
  if (outcome === "Closed") return "Closed Won";
  if (outcome === "Called - Not Interested" || outcome === "Do Not Contact" || outcome === "Wrong Number") return "Closed Lost";
  return "Contacted";
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "\"" && quoted && next === "\"") {
      cell += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function pick(item: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = item[key.toLowerCase()];
    if (value) return value;
  }
  return "";
}

function parseCsv(text: string) {
  const rows = parseCsvRows(text);
  const headers = rows.shift()?.map((header) => header.trim().toLowerCase()) ?? [];

  return rows.map((row) => {
    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      item[header] = row[index] ?? "";
    });

    const website = pick(item, ["website", "websiteUrl", "url"]);
    const category = pick(item, ["categoryName", "category", "industry", "categories/0"]) || "Local Business";
    const city = pick(item, ["city", "neighborhood"]);
    const state = pick(item, ["state", "province"]);
    const postalCode = pick(item, ["postalCode", "postal code", "zip"]);
    const street = pick(item, ["street"]);
    const address = pick(item, ["address"]) || [street, city, state, postalCode].filter(Boolean).join(", ");
    const rating = pick(item, ["rating", "googleRating", "google rating", "stars"]);
    const reviews = pick(item, ["reviews", "reviewCount", "review count", "number of reviews"]);

    return normalizeLead({
      businessName: pick(item, ["title", "business name", "company", "name"]) || "Imported Lead",
      contactName: pick(item, ["contact", "owner", "owner name", "contact name"]),
      phone: pick(item, ["phone", "phoneUnformatted", "phone unformatted", "phone number"]),
      email: pick(item, ["emails", "email"]),
      category,
      address,
      street,
      city: city || state || "Ontario",
      postalCode,
      state,
      countryCode: pick(item, ["countryCode", "country code", "country"]),
      latitude: pick(item, ["location/lat", "lat", "latitude"]),
      longitude: pick(item, ["location/lng", "lng", "longitude"]),
      plusCode: pick(item, ["plusCode", "plus code"]),
      googleRating: Number(rating || 0),
      reviewCount: Number(reviews || 0),
      websiteStatus: website ? detectWebsiteStatus(pick(item, ["website status", "site status"]), website) : "No Website",
      websiteUrl: website,
      socialUrl: pick(item, ["instagram", "facebook", "social", "socialUrl", "social url"]),
      source: pick(item, ["source"]) || "Google Places CSV"
    });
  });
}

function detectWebsiteStatus(raw?: string, website?: string): WebsiteStatus {
  const value = `${raw ?? ""} ${website ?? ""}`.toLowerCase();
  if (!website && !raw) return "Unknown";
  if (!website && raw) return "No Website";
  if (value.includes("no website") || value === "") return "No Website";
  if (value.includes("expired")) return "Website Expired";
  if (value.includes("down")) return "Website Down";
  if (value.includes("weak")) return "Weak Website";
  if (website || value.includes("has")) return "Has Website";
  return "Unknown";
}

function statusClass(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function mapsUrlForLead(lead: Lead) {
  const query = [lead.businessName, lead.address, lead.city, lead.state, lead.postalCode, lead.countryCode].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function websiteUrl(url: string) {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function ColdCallLeadOS({ view, leadId }: Props) {
  const [leads, setLeads] = useState<Lead[]>(seedLeads);
  const [settings, setSettings] = useState<LeadOSSettings>(defaultSettings);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(leadId ?? "");
  const [draftNote, setDraftNote] = useState("");
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvImportMessage, setCsvImportMessage] = useState("");
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState<Partial<Lead>>({ businessName: "", phone: "", category: "", city: "", websiteStatus: "Unknown" });
  const [preCallUnlocked, setPreCallUnlocked] = useState(false);
  const [preCallStep, setPreCallStep] = useState<"breathing" | "script" | "reset">("breathing");
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [cycleCount, setCycleCount] = useState(0);
  const [scriptHold, setScriptHold] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState("");
  const [nowTick, setNowTick] = useState(Date.now());
  const [expandedCallId, setExpandedCallId] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setLeads(JSON.parse(saved).map(normalizeLead));
      } catch {
        setLeads(seedLeads);
      }
    }
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      } catch {
        setSettings(defaultSettings);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, ready]);

  useEffect(() => {
    if (settings.preCallLockEnabled || preCallUnlocked) return;
    setPreCallUnlocked(true);
    if (!sessionStartedAt) setSessionStartedAt(new Date().toISOString());
  }, [preCallUnlocked, sessionStartedAt, settings.preCallLockEnabled]);

  useEffect(() => {
    if (view !== "call-queue" || preCallUnlocked || preCallStep !== "breathing") return;
    const id = window.setInterval(() => {
      setBreathSeconds((seconds) => {
        if (seconds > 1) return seconds - 1;
        setBreathPhase((phase) => {
          if (phase === "Inhale") {
            setBreathSeconds(4);
            return "Hold";
          }
          if (phase === "Hold") {
            setBreathSeconds(6);
            return "Exhale";
          }
          setCycleCount((count) => {
            const next = count + 1;
            if (next >= settings.breathingCycles) setPreCallStep("script");
            return next;
          });
          setBreathSeconds(4);
          return "Inhale";
        });
        return 4;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [preCallStep, preCallUnlocked, settings.breathingCycles, view]);

  useEffect(() => {
    if (!sessionStartedAt) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [sessionStartedAt]);

  useEffect(() => {
    if (preCallStep !== "script" || scriptHold >= 3) return;
    const id = window.setInterval(() => setScriptHold((value) => Math.min(3, value + 1)), 1000);
    return () => window.clearInterval(id);
  }, [preCallStep, scriptHold]);

  useEffect(() => {
    setSelectedId(leadId ?? "");
  }, [leadId]);

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      const due = Number(isDue(b.nextFollowUpDate)) - Number(isDue(a.nextFollowUpDate));
      if (due) return due;
      return b.score - a.score;
    });
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return sortedLeads.filter((lead) => {
      const matchesSearch = [lead.businessName, lead.category, lead.city, lead.phone].join(" ").toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "All" ||
        lead.websiteStatus === filter ||
        lead.priority === filter ||
        lead.callStatus === filter ||
        lead.stage === filter ||
        (filter === "Follow-ups" && isDue(lead.nextFollowUpDate));
      return matchesSearch && matchesFilter;
    });
  }, [filter, search, sortedLeads]);

  const selectedLead = leads.find((lead) => lead.id === (selectedId || leadId)) ?? sortedLeads[0];

  function updateLead(id: string, updater: (lead: Lead) => Lead) {
    setLeads((current) => current.map((lead) => (lead.id === id ? normalizeLead(updater(lead)) : lead)));
  }

  function logOutcome(id: string, outcome: CallStatus, objection = "") {
    updateLead(id, (lead) => {
      const nextAction = nextActionFor(outcome);
      const followUpDate = followUpDateFor(outcome);
      const summary = followUpNote(lead, outcome);
      const attempt: CallAttempt = {
        id: uid(),
        at: new Date().toISOString(),
        outcome,
        notes: summary,
        nextAction,
        followUpDate,
        scriptUsed: lead.websiteStatus === "No Website" ? "No website opener" : lead.websiteStatus.includes("Website") ? "Website opportunity opener" : "General growth opener",
        objection
      };

      return {
        ...lead,
        callStatus: outcome,
        stage: stageForOutcome(outcome),
        lastContactedDate: today,
        nextFollowUpDate: followUpDate,
        objections: objection ? Array.from(new Set([objection, ...lead.objections])) : lead.objections,
        notes: `${lead.notes ? `${lead.notes}\n\n` : ""}[${new Date().toLocaleString()}] ${summary}`,
        callHistory: [attempt, ...lead.callHistory],
        updatedAt: new Date().toISOString()
      };
    });
  }

  function logCallQueueOutcome(id: string, outcome: CallStatus) {
    logOutcome(id, outcome);
    setExpandedCallId("");
  }

  function unlockCallMode() {
    setPreCallUnlocked(true);
    setSessionStartedAt(new Date().toISOString());
  }

  function resetPreCallLock() {
    setPreCallUnlocked(false);
    setPreCallStep("breathing");
    setBreathSeconds(4);
    setBreathPhase("Inhale");
    setCycleCount(0);
    setScriptHold(0);
    setSessionStartedAt("");
  }

  function saveDraftNote(id: string) {
    if (!draftNote.trim()) return;
    updateLead(id, (lead) => ({
      ...lead,
      notes: `${lead.notes ? `${lead.notes}\n\n` : ""}[${new Date().toLocaleString()}] ${draftNote.trim()}`,
      updatedAt: new Date().toISOString()
    }));
    setDraftNote("");
  }

  function addLead() {
    if (!newLead.businessName?.trim()) return;
    const created = normalizeLead({
      ...newLead,
      source: newLead.source ?? "Manual Entry",
      stage: "Need to Call",
      callStatus: "Not Called"
    });
    setLeads((current) => [created, ...current]);
    setSelectedId(created.id);
    setNewLeadOpen(false);
    setNewLead({ businessName: "", phone: "", category: "", city: "", websiteStatus: "Unknown" });
  }

  function importCsv() {
    const imported = parseCsv(csvText);
    if (!imported.length) {
      setCsvImportMessage("No valid rows found yet. Upload a CSV file or paste CSV rows first.");
      return;
    }
    setLeads((current) => [...imported, ...current]);
    setCsvText("");
    setCsvOpen(false);
    setCsvImportMessage(`Imported ${imported.length} lead${imported.length === 1 ? "" : "s"} into Need to Call.`);
  }

  async function handleCsvFile(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvImportMessage("Please choose a .csv file.");
      return;
    }

    const text = await file.text();
    const imported = parseCsv(text);

    if (!imported.length) {
      setCsvImportMessage("That CSV did not include readable lead rows.");
      return;
    }

    setLeads((current) => [...imported, ...current]);
    setCsvText("");
    setCsvOpen(false);
    setCsvImportMessage(`Imported ${imported.length} lead${imported.length === 1 ? "" : "s"} from ${file.name}.`);
  }

  function deleteLead(id: string) {
    if (!window.confirm("Delete this lead and its call history?")) return;
    setLeads((current) => current.filter((lead) => lead.id !== id));
  }

  function resetLeadOSData() {
    const confirmed = window.confirm(
      "Delete ALL LeadOS leads, call history, notes, follow-ups, and reset call settings? This cannot be undone."
    );

    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    setLeads([]);
    setSettings(defaultSettings);
    setSelectedId("");
    setDraftNote("");
    setCsvText("");
    setCsvOpen(false);
    setCsvImportMessage("LeadOS has been reset. All leads and call data were deleted.");
    resetPreCallLock();
  }

  const stats = useMemo(() => {
    const callsToday = leads.filter((lead) => lead.callHistory.some((call) => call.at.slice(0, 10) === today)).length;
    const closed = leads.filter((lead) => lead.stage === "Closed Won").length;
    const meetings = leads.filter((lead) => lead.stage === "Meeting Booked").length;
    return {
      total: leads.length,
      callsToday,
      due: leads.filter((lead) => isDue(lead.nextFollowUpDate)).length,
      hot: leads.filter((lead) => lead.priority === "Hot").length,
      noWebsite: leads.filter((lead) => lead.websiteStatus === "No Website").length,
      expired: leads.filter((lead) => lead.websiteStatus === "Website Expired" || lead.websiteStatus === "Website Down").length,
      meetings,
      closed,
      conversion: leads.length ? Math.round((closed / leads.length) * 100) : 0
    };
  }, [leads]);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Zentrixa LeadOS</p>
          <h1>{titleFor(view)}</h1>
          <p>{subtitleFor(view)}</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryButton} type="button" onClick={() => setCsvOpen((value) => !value)}>
            Import CSV
          </button>
          <button className={styles.primaryButton} type="button" onClick={() => setNewLeadOpen(true)}>
            Add Lead
          </button>
        </div>
      </header>

      {csvOpen ? (
        <section className={styles.panel}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>CSV Import</p>
              <h2>Paste local business leads</h2>
            </div>
            <span>Auto scores and moves into Need to Call</span>
          </div>
          <label className={styles.fileImport}>
            <span>Upload CSV file</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => handleCsvFile(event.target.files?.[0])}
            />
          </label>
          <div className={styles.importDivider}>or paste CSV rows</div>
          <textarea
            className={styles.textarea}
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            placeholder="business name,phone,category,city,rating,reviews,website,website status"
          />
          <button className={styles.primaryButton} type="button" onClick={importCsv}>
            Import leads
          </button>
        </section>
      ) : null}

      {csvImportMessage ? <div className={styles.importToast}>{csvImportMessage}</div> : null}

      {newLeadOpen ? (
        <section className={styles.panel}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>New opportunity</p>
              <h2>Add a cold-call lead</h2>
            </div>
            <button className={styles.iconButton} type="button" onClick={() => setNewLeadOpen(false)}>
              x
            </button>
          </div>
          <div className={styles.formGrid}>
            <input className={styles.input} value={newLead.businessName ?? ""} onChange={(e) => setNewLead((lead) => ({ ...lead, businessName: e.target.value }))} placeholder="Business name" />
            <input className={styles.input} value={newLead.contactName ?? ""} onChange={(e) => setNewLead((lead) => ({ ...lead, contactName: e.target.value }))} placeholder="Owner/contact name" />
            <input className={styles.input} value={newLead.phone ?? ""} onChange={(e) => setNewLead((lead) => ({ ...lead, phone: e.target.value }))} placeholder="Phone number" />
            <input className={styles.input} value={newLead.category ?? ""} onChange={(e) => setNewLead((lead) => ({ ...lead, category: e.target.value }))} placeholder="Business category" />
            <input className={styles.input} value={newLead.city ?? ""} onChange={(e) => setNewLead((lead) => ({ ...lead, city: e.target.value }))} placeholder="City" />
            <select className={styles.input} value={newLead.websiteStatus ?? "Unknown"} onChange={(e) => setNewLead((lead) => ({ ...lead, websiteStatus: e.target.value as WebsiteStatus }))}>
              {["No Website", "Website Down", "Website Expired", "Weak Website", "Has Website", "Unknown"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
          <button className={styles.primaryButton} type="button" onClick={addLead}>
            Create lead
          </button>
        </section>
      ) : null}

      {view === "dashboard" ? renderDashboard() : null}
      {view === "leads" ? renderLeads() : null}
      {view === "detail" ? renderDetail(selectedLead) : null}
      {view === "call-queue" ? renderCallQueue() : null}
      {view === "pipeline" ? renderPipeline() : null}
      {view === "scripts" ? renderScripts() : null}
      {view === "follow-ups" ? renderFollowUps() : null}
      {view === "analytics" ? renderAnalytics() : null}
      {view === "settings" ? renderSettings() : null}
    </div>
  );

  function renderDashboard() {
    return (
      <>
        <section className={styles.metricGrid}>
          <Metric label="Total leads" value={stats.total} />
          <Metric label="Calls today" value={stats.callsToday} />
          <Metric label="Follow-ups due" value={stats.due} />
          <Metric label="Hot leads" value={stats.hot} />
          <Metric label="No website" value={stats.noWebsite} />
          <Metric label="Expired/down" value={stats.expired} />
          <Metric label="Meetings booked" value={stats.meetings} />
          <Metric label="Close rate" value={`${stats.conversion}%`} />
        </section>

        <section className={styles.workspaceGrid}>
          <div className={styles.stack}>
            <QueueBlock title="Today's Call Queue" leads={sortedLeads.slice(0, 5)} />
            <QueueBlock title="Hot Opportunities" leads={sortedLeads.filter((lead) => lead.priority === "Hot" || lead.score >= 75).slice(0, 5)} />
          </div>
          <aside className={styles.stack}>
            <OpportunityBreakdown leads={leads} />
            <Assistant lead={selectedLead} />
          </aside>
        </section>
      </>
    );
  }

  function renderLeads() {
    return (
      <section className={styles.panel}>
        <LeadToolbar />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Business name</th>
                <th>Category</th>
                <th>Phone</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Website</th>
                <th>Priority</th>
                <th>Call status</th>
                <th>Last call</th>
                <th>Next follow-up</th>
                <th>Stage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td><strong>{lead.businessName}</strong><span>{lead.city}</span></td>
                  <td>{lead.category}</td>
                  <td>{lead.phone || "-"}</td>
                  <td>{lead.googleRating ? lead.googleRating.toFixed(1) : "-"}</td>
                  <td>{lead.reviewCount}</td>
                  <td><Badge value={lead.websiteStatus} /></td>
                  <td><Badge value={lead.priority} /></td>
                  <td>{lead.callStatus}</td>
                  <td>{lead.lastContactedDate || "-"}</td>
                  <td>{lead.nextFollowUpDate || "-"}</td>
                  <td>{lead.stage}</td>
                  <td>
                    <div className={styles.tableActions}>
                      <a className={styles.smallButton} href={lead.phone ? `tel:${lead.phone.replace(/[^\d+]/g, "")}` : "#"}>Call</a>
                      <Link className={styles.smallButton} href={`/app/leads/${lead.id}`}>View</Link>
                      <button className={styles.dangerButton} type="button" onClick={() => deleteLead(lead.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderDetail(lead?: Lead) {
    if (!lead) {
      return <section className={styles.empty}>No lead selected yet. Add or import a lead to start calling.</section>;
    }

    return (
      <section className={styles.detailGrid}>
        <div className={styles.stack}>
          <section className={styles.panel}>
            <div className={styles.detailHero}>
              <div>
                <p className={styles.kicker}>Lead workspace</p>
                <h2>{lead.businessName}</h2>
                <p>{lead.category} in {lead.city || "Ontario"} - {lead.reviewCount} reviews - {lead.googleRating ? `${lead.googleRating.toFixed(1)} rating` : "rating unknown"}</p>
              </div>
              <div className={styles.scoreRing}>{lead.score}<span>/100</span></div>
            </div>
            <div className={styles.badgeRow}>
              <Badge value={lead.websiteStatus} />
              <Badge value={lead.priority} />
              <Badge value={lead.callStatus} />
              <Badge value={lead.stage} />
            </div>
            <div className={styles.quickActions}>
              <a className={styles.primaryButton} href={lead.phone ? `tel:${lead.phone.replace(/[^\d+]/g, "")}` : "#"}>Call</a>
              <button className={styles.secondaryButton} type="button" onClick={() => logOutcome(lead.id, "Called - Interested")}>Mark Interested</button>
              <button className={styles.secondaryButton} type="button" onClick={() => logOutcome(lead.id, "Called - No Answer")}>No Answer</button>
              <button className={styles.secondaryButton} type="button" onClick={() => logOutcome(lead.id, "Booked Meeting")}>Book Meeting</button>
              <button className={styles.secondaryButton} type="button" onClick={() => logOutcome(lead.id, "Call Back Later")}>Follow Up</button>
              <button className={styles.secondaryButton} type="button" onClick={() => logOutcome(lead.id, "Closed")}>Close Lead</button>
              <button className={styles.dangerButton} type="button" onClick={() => logOutcome(lead.id, "Do Not Contact")}>Archive</button>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.kicker}>One-click logging</p>
                <h2>Call outcome</h2>
              </div>
            </div>
            <div className={styles.outcomeGrid}>
              {["Called - No Answer", "Called - Interested", "Called - Not Interested", "Call Back Later"].map((outcome) => (
                <button key={outcome} className={styles.outcomeButton} type="button" onClick={() => logOutcome(lead.id, outcome as CallStatus)}>
                  {outcome.replace("Called - ", "")}
                  <span>{nextActionFor(outcome as CallStatus)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.kicker}>Smart notes</p>
                <h2>Lead memory</h2>
              </div>
              <span>AI never overwrites manual notes</span>
            </div>
            <div className={styles.memoryCard}>{summarizeLead(lead)}</div>
            <textarea className={styles.textarea} value={draftNote} onChange={(event) => setDraftNote(event.target.value)} placeholder="Add manual notes, objections, or details from the call." />
            <button className={styles.primaryButton} type="button" onClick={() => saveDraftNote(lead.id)}>Save note</button>
            <pre className={styles.notes}>{lead.notes || "No notes yet. Click an outcome after a call and LeadOS will generate a summary here."}</pre>
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.kicker}>Timeline</p>
                <h2>Call history</h2>
              </div>
            </div>
            <div className={styles.timeline}>
              {lead.callHistory.length ? lead.callHistory.map((call) => (
                <article key={call.id} className={styles.timelineItem}>
                  <strong>{call.outcome}</strong>
                  <span>{new Date(call.at).toLocaleString()}</span>
                  <p>{call.notes}</p>
                  <small>Next: {call.nextAction}{call.followUpDate ? ` - ${call.followUpDate}` : ""}</small>
                </article>
              )) : <div className={styles.emptyInline}>No calls logged yet.</div>}
            </div>
          </section>
        </div>

        <aside className={styles.stack}>
          <section className={styles.panel}>
            <p className={styles.kicker}>Business profile</p>
            <div className={styles.infoList}>
              <Info label="Business" value={lead.businessName} />
              <Info label="Category" value={lead.category || "-"} />
              <Info label="Phone" value={lead.phone || "-"} href={lead.phone ? `tel:${lead.phone.replace(/[^\d+]/g, "")}` : ""} action="Call" />
              <Info label="Website" value={lead.websiteUrl || "No website in CSV"} href={lead.websiteUrl ? websiteUrl(lead.websiteUrl) : ""} action="Open" />
              <Info label="Email" value={lead.email || "No email in CSV"} href={lead.email ? `mailto:${lead.email}` : ""} action="Email" />
              <Info label="Address" value={lead.address || "-"} href={lead.address || (lead.latitude && lead.longitude) ? mapsUrlForLead(lead) : ""} action="Maps" />
              <Info label="Street" value={lead.street || "-"} />
              <Info label="City" value={lead.city || "-"} />
              <Info label="Postal Code" value={lead.postalCode || "-"} />
              <Info label="Province" value={lead.state || "-"} />
              <Info label="Country" value={lead.countryCode || "-"} />
              <Info label="Coordinates" value={lead.latitude && lead.longitude ? `${lead.latitude}, ${lead.longitude}` : "-"} href={lead.latitude && lead.longitude ? mapsUrlForLead(lead) : ""} action="Maps" />
              <Info label="Plus Code" value={lead.plusCode || "-"} />
              <Info label="Source" value={lead.source || "-"} />
            </div>
          </section>
          <section className={styles.panel}>
            <p className={styles.kicker}>Recommended pitch</p>
            <h2>{lead.servicesRecommended[0] ?? "Website Setup"}</h2>
            <p>{pitchAngle(lead)}</p>
            <div className={styles.badgeRow}>{lead.tags.map((tag) => <Badge key={tag} value={tag} />)}</div>
          </section>
          <Assistant lead={lead} />
        </aside>
      </section>
    );
  }

  function renderCallQueue() {
    if (settings.preCallLockEnabled && !preCallUnlocked) {
      return <PreCallLock lead={sortedLeads[0]} />;
    }

    const sessionElapsed = sessionStartedAt ? Math.floor((nowTick - new Date(sessionStartedAt).getTime()) / 1000) : 0;
    const remaining = settings.sessionTimerEnabled ? Math.max(0, settings.sessionMinutes * 60 - sessionElapsed) : sessionElapsed;
    const sessionCalls = sessionStartedAt
      ? leads.reduce((total, lead) => total + lead.callHistory.filter((call) => new Date(call.at) >= new Date(sessionStartedAt)).length, 0)
      : 0;
    const sessionAnswers = sessionStartedAt
      ? leads.filter((lead) => lead.callHistory.some((call) => new Date(call.at) >= new Date(sessionStartedAt) && !["Called - No Answer", "Voicemail Left"].includes(call.outcome))).length
      : 0;
    const sessionInterested = sessionStartedAt
      ? leads.filter((lead) => lead.callHistory.some((call) => new Date(call.at) >= new Date(sessionStartedAt) && call.outcome === "Called - Interested")).length
      : 0;
    const sessionMeetings = sessionStartedAt
      ? leads.filter((lead) => lead.callHistory.some((call) => new Date(call.at) >= new Date(sessionStartedAt) && call.outcome === "Booked Meeting")).length
      : 0;

    return (
      <div className={styles.callSession}>
        <section className={styles.sessionBar}>
          <div>
            <p className={styles.kicker}>Call session mode</p>
            <h2>{settings.sessionTimerEnabled ? formatClock(remaining) : formatClock(sessionElapsed)} focus</h2>
          </div>
          <Metric label="Calls" value={sessionCalls} />
          <Metric label="Answers" value={sessionAnswers} />
          <Metric label="Interested" value={sessionInterested} />
          <Metric label="Meetings" value={sessionMeetings} />
          <button className={styles.secondaryButton} type="button" onClick={resetPreCallLock}>Reset lock</button>
        </section>
        <section className={styles.queueGrid}>
          {sortedLeads.filter((lead) => !["Closed Won", "Closed Lost", "Not Fit"].includes(lead.stage)).map((lead) => (
            <article key={lead.id} className={`${styles.queueCard} ${expandedCallId === lead.id ? styles.expandedQueueCard : ""}`}>
              <div className={styles.cardTop}>
                <div>
                  <h3>{lead.businessName}</h3>
                  <p>{lead.category} - {lead.city}</p>
                </div>
                <div className={styles.scorePill}>{lead.score}</div>
              </div>
              <div className={styles.badgeRow}>
                <Badge value={lead.websiteStatus} />
                <Badge value={`${lead.reviewCount} reviews`} />
                <Badge value={lead.priority} />
              </div>
              <p className={styles.scriptHint}>{pitchAngle(lead)}</p>
              <div className={styles.quickActions}>
                <button className={styles.primaryButton} type="button" onClick={() => setExpandedCallId(expandedCallId === lead.id ? "" : lead.id)}>Call</button>
                {lead.websiteUrl ? (
                  <a className={styles.secondaryButton} href={websiteUrl(lead.websiteUrl)} target="_blank" rel="noreferrer">Website</a>
                ) : (
                  <button className={styles.secondaryButton} type="button" disabled>No Website</button>
                )}
                <a className={styles.secondaryButton} href={mapsUrlForLead(lead)} target="_blank" rel="noreferrer">Map</a>
                <Link className={styles.secondaryButton} href={`/app/leads/${lead.id}`}>View</Link>
              </div>
              {expandedCallId === lead.id ? (
                <div className={styles.callPrepPanel}>
                  <div className={styles.callPrepTop}>
                    <div>
                      <p className={styles.kicker}>Call prep</p>
                      <h4>{lead.phone || "No phone in CSV"}</h4>
                    </div>
                    {lead.phone ? <a className={styles.primaryButton} href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}>Dial now</a> : null}
                  </div>
                  <div className={styles.pricingGrid}>
                    <div><strong>Website Setup</strong><span>Starting at $299</span></div>
                    <div><strong>Monthly Content</strong><span>From $79/month</span></div>
                    <div><strong>Content + Ads</strong><span>From $150/month</span></div>
                  </div>
                  <div className={styles.callScriptGrid}>
                    {scriptLibrary.slice(0, 3).map((script) => (
                      <section key={script.title}>
                        <span>{script.category}</span>
                        <strong>{script.title}</strong>
                        <p>{script.body}</p>
                      </section>
                    ))}
                  </div>
                  <div className={styles.callOutcomeBar}>
                    <span>How did the call go?</span>
                    <button className={styles.secondaryButton} type="button" onClick={() => logCallQueueOutcome(lead.id, "Called - No Answer")}>No Answer</button>
                    <button className={styles.secondaryButton} type="button" onClick={() => logCallQueueOutcome(lead.id, "Called - Interested")}>Interested</button>
                    <button className={styles.secondaryButton} type="button" onClick={() => logCallQueueOutcome(lead.id, "Booked Meeting")}>Booked</button>
                    <button className={styles.secondaryButton} type="button" onClick={() => logCallQueueOutcome(lead.id, "Called - Not Interested")}>Not Interested</button>
                    <button className={styles.secondaryButton} type="button" onClick={() => logCallQueueOutcome(lead.id, "Call Back Later")}>Call Back</button>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    );
  }

  function renderPipeline() {
    return (
      <section className={styles.pipeline}>
        {stages.map((stage) => {
          const stageLeads = leads.filter((lead) => lead.stage === stage);
          return (
            <article key={stage} className={styles.pipelineColumn}>
              <div className={styles.columnHead}>
                <h3>{stage}</h3>
                <span>{stageLeads.length}</span>
              </div>
              {stageLeads.map((lead) => (
                <Link key={lead.id} href={`/app/leads/${lead.id}`} className={styles.pipelineCard}>
                  <strong>{lead.businessName}</strong>
                  <span>{lead.category} - {lead.city}</span>
                  <div className={styles.badgeRow}><Badge value={lead.websiteStatus} /><Badge value={`${lead.score}/100`} /></div>
                </Link>
              ))}
            </article>
          );
        })}
      </section>
    );
  }

  function renderScripts() {
    return (
      <section className={styles.scriptGrid}>
        {scriptLibrary.map((script) => (
          <article key={script.title} className={styles.panel}>
            <p className={styles.kicker}>{script.category}</p>
            <h2>{script.title}</h2>
            <p>{script.body}</p>
          </article>
        ))}
      </section>
    );
  }

  function renderFollowUps() {
    const due = leads.filter((lead) => isDue(lead.nextFollowUpDate));
    return due.length ? (
      <section className={styles.queueGrid}>
        {due.map((lead) => (
          <article key={lead.id} className={styles.queueCard}>
            <div className={styles.cardTop}>
              <div>
                <h3>{lead.businessName}</h3>
                <p>Due {lead.nextFollowUpDate || "today"}</p>
              </div>
              <Badge value={lead.priority} />
            </div>
            <p>{followUpNote(lead, lead.callStatus)}</p>
            <div className={styles.quickActions}>
              <a className={styles.primaryButton} href={lead.phone ? `tel:${lead.phone.replace(/[^\d+]/g, "")}` : "#"}>Call now</a>
              <button className={styles.secondaryButton} onClick={() => logOutcome(lead.id, "Called - Interested")}>Interested</button>
              <Link className={styles.secondaryButton} href={`/app/leads/${lead.id}`}>Open lead</Link>
            </div>
          </article>
        ))}
      </section>
    ) : <section className={styles.empty}>No follow-ups due right now. The queue is clean.</section>;
  }

  function renderAnalytics() {
    const answered = leads.filter((lead) => ["Called - Interested", "Called - Not Interested", "Booked Meeting", "Closed"].includes(lead.callStatus)).length;
    const calls = leads.reduce((total, lead) => total + lead.callHistory.length, 0);
    return (
      <section className={styles.workspaceGrid}>
        <div className={styles.metricGrid}>
          <Metric label="Calls made" value={calls} />
          <Metric label="Answer rate" value={`${leads.length ? Math.round((answered / leads.length) * 100) : 0}%`} />
          <Metric label="Interested rate" value={`${leads.length ? Math.round((leads.filter((lead) => lead.callStatus === "Called - Interested").length / leads.length) * 100) : 0}%`} />
          <Metric label="Deals closed" value={stats.closed} />
        </div>
        <OpportunityBreakdown leads={leads} />
      </section>
    );
  }

  function renderSettings() {
    return (
      <section className={styles.settingsGrid}>
        <article className={styles.panel}>
          <p className={styles.kicker}>Pre-call lock</p>
          <h2>Call routine</h2>
          <div className={styles.settingList}>
            <label><input type="checkbox" checked={settings.preCallLockEnabled} onChange={(event) => setSettings((value) => ({ ...value, preCallLockEnabled: event.target.checked }))} /> Require pre-call lock</label>
            <label><input type="checkbox" checked={settings.sessionTimerEnabled} onChange={(event) => setSettings((value) => ({ ...value, sessionTimerEnabled: event.target.checked }))} /> Enable session timer</label>
            <label>Breathing cycles <input className={styles.miniInput} type="number" min={3} max={5} value={settings.breathingCycles} onChange={(event) => setSettings((value) => ({ ...value, breathingCycles: Number(event.target.value) }))} /></label>
            <label>Session minutes <input className={styles.miniInput} type="number" min={5} max={90} value={settings.sessionMinutes} onChange={(event) => setSettings((value) => ({ ...value, sessionMinutes: Number(event.target.value) }))} /></label>
            <label>Default script
              <select className={styles.input} value={settings.defaultScript} onChange={(event) => setSettings((value) => ({ ...value, defaultScript: event.target.value as LeadOSSettings["defaultScript"] }))}>
                <option>Expired website</option>
                <option>No website</option>
                <option>Weak website</option>
                <option>General cold call</option>
              </select>
            </label>
          </div>
        </article>
        <article className={`${styles.panel} ${styles.dangerPanel}`}>
          <p className={styles.kicker}>Danger zone</p>
          <h2>Reset LeadOS</h2>
          <p>Delete every imported lead, note, call log, follow-up, saved queue state, and reset call settings back to default.</p>
          <button className={styles.dangerButton} type="button" onClick={resetLeadOSData}>
            Delete all leads and reset everything
          </button>
        </article>
        <SettingsCard title="Scoring rules" items={["No website +25", "Expired/down website +30", "High reviews +12", "Follow-up due +10", "Not contacted +7"]} />
        <SettingsCard title="Call outcomes" items={callStatuses} />
        <SettingsCard title="Pipeline stages" items={stages} />
        <SettingsCard title="Pricing" items={["Website Setup starts at $299", "Monthly Content & Growth from $79/month", "Content + Ads Management from $150/month"]} />
      </section>
    );
  }

  function PreCallLock({ lead }: { lead?: Lead }) {
    const script = selectPreCallScript(lead, settings.defaultScript);

    return (
      <section className={styles.preCallLock}>
        <div className={styles.lockPanel}>
          <p className={styles.kicker}>Pre-call lock</p>
          <h2>Warm up before entering the queue.</h2>
          <p>Reduce panic, improve confidence, and start the session with a clean head.</p>
          <div className={styles.lockSteps}>
            <span className={preCallStep === "breathing" ? styles.activeStep : ""}>1 Breathing</span>
            <span className={preCallStep === "script" ? styles.activeStep : ""}>2 Script</span>
            <span className={preCallStep === "reset" ? styles.activeStep : ""}>3 Reset</span>
          </div>

          {preCallStep === "breathing" ? (
            <div className={styles.breathingCard}>
              <div className={styles.breathOrb}>{breathSeconds}</div>
              <h3>{breathPhase}</h3>
              <p>Cycle {Math.min(cycleCount + 1, settings.breathingCycles)} of {settings.breathingCycles}</p>
              <small>Inhale 4 seconds, hold 4 seconds, exhale 6 seconds.</small>
            </div>
          ) : null}

          {preCallStep === "script" ? (
            <div className={styles.scriptActivation}>
              <p className={styles.kicker}>{script.category}</p>
              <h3>{script.title}</h3>
              <p>{script.body}</p>
              <button className={styles.primaryButton} type="button" onClick={() => setPreCallStep("reset")}>
                {scriptHold >= 3 ? "Done reading out loud" : `Read out loud - ${3 - scriptHold}s`}
              </button>
            </div>
          ) : null}

          {preCallStep === "reset" ? (
            <div className={styles.mentalReset}>
              <h3>You are not selling.</h3>
              <p>You are helping them fix a problem. They either need this or they do not.</p>
              <button className={styles.primaryButton} type="button" onClick={unlockCallMode}>I'm ready</button>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  function LeadToolbar() {
    const filterOptions = ["All", "No Website", "Website Expired", "Weak Website", "Follow-ups", "Hot", "Warm", "Not Contacted", "Called - Interested", "Need to Call"];
    return (
      <div className={styles.toolbar}>
        <input className={styles.search} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search business, category, city, phone..." />
        <div className={styles.filterRow}>
          {filterOptions.map((option) => (
            <button key={option} className={filter === option ? styles.activeFilter : styles.filterButton} onClick={() => setFilter(option)} type="button">
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function QueueBlock({ title, leads: blockLeads }: { title: string; leads: Lead[] }) {
    return (
      <section className={styles.panel}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.kicker}>Priority</p>
            <h2>{title}</h2>
          </div>
          <Link className={styles.smallButton} href="/app/call-queue">Open queue</Link>
        </div>
        <div className={styles.compactList}>
          {blockLeads.map((lead) => (
            <Link key={lead.id} href={`/app/leads/${lead.id}`} className={styles.compactItem}>
              <div>
                <strong>{lead.businessName}</strong>
                <span>{lead.websiteStatus} - {lead.category}</span>
              </div>
              <b>{lead.score}</b>
            </Link>
          ))}
        </div>
      </section>
    );
  }
}

function formatClock(seconds: number) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function selectPreCallScript(lead: Lead | undefined, fallback: LeadOSSettings["defaultScript"]) {
  const category = lead?.websiteStatus === "Website Expired" || lead?.websiteStatus === "Website Down"
    ? "Expired website"
    : lead?.websiteStatus === "No Website"
      ? "No website"
      : lead?.websiteStatus === "Weak Website"
        ? "Weak website"
        : fallback;

  if (category === "Expired website") return scriptLibrary[0];
  if (category === "No website") return scriptLibrary[1];
  if (category === "Weak website") return scriptLibrary[2];
  return {
    category: "General cold call",
    title: "Growth opener",
    body: "Hey, this is Zentrixa. We help local businesses turn their website, content, and follow-up into more customers. Are you currently happy with how many customers your online presence is bringing in?"
  };
}

function titleFor(view: ColdCallView) {
  const titles: Record<ColdCallView, string> = {
    dashboard: "Cold call command center",
    leads: "Lead database",
    detail: "Lead detail",
    "call-queue": "Call queue",
    pipeline: "Sales pipeline",
    scripts: "Cold call scripts",
    "follow-ups": "Follow-ups due",
    analytics: "Calling analytics",
    settings: "LeadOS settings"
  };
  return titles[view];
}

function subtitleFor(view: ColdCallView) {
  const subtitles: Record<ColdCallView, string> = {
    dashboard: "Know who to call, why they matter, and what to do next.",
    leads: "Import, filter, score, and work local business opportunities.",
    detail: "Call, log outcomes, generate notes, and keep every lead moving.",
    "call-queue": "Prioritized by follow-ups, score, website gaps, and call urgency.",
    pipeline: "Move cold calls from new lead to closed won without clutter.",
    scripts: "Fast openers and objection responses for Zentrixa services.",
    "follow-ups": "Every promised callback and warm lead in one place.",
    analytics: "Track calls, answer rate, meetings, and closed deals.",
    settings: "Customize the operating logic behind your lead chasing system."
  };
  return subtitles[view];
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <article className={styles.metric}>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function Badge({ value }: { value: string }) {
  return <span className={`${styles.badge} ${styles[statusClass(value)] ?? ""}`}>{value}</span>;
}

function Info({ label, value, href, action }: { label: string; value: string; href?: string; action?: string }) {
  const content = (
    <>
      <span>{label}</span>
      <strong>{value}</strong>
      {href && action ? <em>{action}</em> : null}
    </>
  );

  if (href) {
    return (
      <a className={`${styles.infoItem} ${styles.clickableInfo}`} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
        {content}
      </a>
    );
  }

  return <div className={styles.infoItem}>{content}</div>;
}

function OpportunityBreakdown({ leads }: { leads: Lead[] }) {
  const groups: WebsiteStatus[] = ["No Website", "Website Down", "Website Expired", "Weak Website", "Has Website", "Unknown"];
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.kicker}>Website opportunity</p>
          <h2>Breakdown</h2>
        </div>
      </div>
      <div className={styles.breakdown}>
        {groups.map((group) => {
          const count = leads.filter((lead) => lead.websiteStatus === group).length;
          return (
            <div key={group}>
              <span>{group}</span>
              <strong>{count}</strong>
              <i style={{ width: `${leads.length ? Math.max(8, (count / leads.length) * 100) : 0}%` }} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Assistant({ lead }: { lead?: Lead }) {
  if (!lead) return null;
  return (
    <section className={styles.assistant}>
      <p className={styles.kicker}>AI assistant</p>
      <h2>What to say next</h2>
      <p>{summarizeLead(lead)}</p>
      <div className={styles.assistantList}>
        <span>Opener: {pitchAngle(lead)}</span>
        <span>Follow-up: {followUpNote(lead, lead.callStatus)}</span>
        <span>Service: {lead.servicesRecommended[0] ?? "Website Setup"}</span>
      </div>
    </section>
  );
}

function SettingsCard({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <article className={styles.panel}>
      <p className={styles.kicker}>Customize</p>
      <h2>{title}</h2>
      <div className={styles.textList}>
        {items.map((item) => <span key={item}>{item}</span>)}
      </div>
    </article>
  );
}
