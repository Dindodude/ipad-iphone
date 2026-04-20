"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LEAD_STAGE_ORDER } from "@/lib/types";
import type { Campaign, Client, LeadStage, LeadWithRelations, WhatsAppStatus } from "@/lib/types";

function getNextAction(stage: LeadStage, whatsappStatus: WhatsAppStatus) {
  if (whatsappStatus === "unknown") return "Check WhatsApp first";
  if (whatsappStatus === "no") return "Deprioritize or use alternate channel";
  if (stage === "New") return "Send first message";
  if (stage === "Contacted") return "Push for a reply";
  if (stage === "Replied") return "Nudge toward interest";
  if (stage === "Interested") return "Sharpen the offer";
  if (stage === "Qualified") return "Close with a trial";
  if (stage === "Won") return "Keep delivery tight";
  return "Archive and revisit later";
}

function buildWhatsAppUrl(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

function buildMapsUrl(lead: LeadWithRelations) {
  const query = encodeURIComponent(lead.address || `${lead.businessName} ${lead.city}`.trim());
  return query ? `https://www.google.com/maps/search/?api=1&query=${query}` : "#";
}

function getPriorityDisplay(priority: LeadWithRelations["priority"]) {
  if (priority === "high") return "Hot";
  if (priority === "medium") return "Warm";
  return "Cold";
}

function getPriorityValueFromDisplay(value: string): LeadWithRelations["priority"] {
  if (value === "Hot") return "high";
  if (value === "Warm") return "medium";
  return "low";
}

function getMomentumState(lead: LeadWithRelations) {
  const score = lead.score ?? 0;
  if (score >= 75) return { label: "Hot", css: "hot", width: `${score}%` };
  if (score >= 45) return { label: "Warm", css: "warm", width: `${score}%` };
  return { label: "Cold", css: "cold", width: `${Math.max(score, 6)}%` };
}

function getLegacyStatusLabel(stage: LeadStage) {
  if (stage === "New") return "Not Contacted";
  return stage;
}

function getLegacyActionCard(stage: LeadStage, whatsappStatus: WhatsAppStatus) {
  if (whatsappStatus === "unknown") {
    return {
      title: "Check WhatsApp First",
      description: "Open WhatsApp, verify the number, then decide whether this lead is worth pushing."
    };
  }

  if (whatsappStatus === "no") {
    return {
      title: "Switch Channel",
      description: "No WhatsApp found. Use a call, email, or move this lead down in priority."
    };
  }

  if (stage === "New") {
    return {
      title: "Send First Message",
      description: "Open scripts and send your opening DM now."
    };
  }

  if (stage === "Contacted") {
    return {
      title: "Follow Up in 24h",
      description: "They have not replied yet. Send a short value-based follow-up."
    };
  }

  if (stage === "Replied") {
    return {
      title: "Push Into Interest",
      description: "Keep the conversation moving and qualify what they actually need."
    };
  }

  if (stage === "Interested") {
    return {
      title: "Send Offer or Free Trial",
      description: "Strike while the lead is warm and move them toward a concrete next step."
    };
  }

  if (stage === "Qualified") {
    return {
      title: "Close the Opportunity",
      description: "You have enough signal. Focus on offer clarity, proof, and commitment."
    };
  }

  if (stage === "Won") {
    return {
      title: "Protect the Win",
      description: "Keep delivery tight and look for expansion or referrals."
    };
  }

  return {
    title: "Archive and Learn",
    description: "Capture what happened, tag the loss correctly, and move to the next lead."
  };
}

function getScoreChecklist(lead: LeadWithRelations) {
  const hasWebsite = /website:/i.test(lead.notes);
  const hasEmail = Boolean(lead.email);
  const hasPhone = Boolean(lead.phone);
  const hasWhatsapp = lead.whatsappStatus === "yes";
  const hasCategory = Boolean(lead.niche);
  const hasCity = Boolean(lead.city);
  const hasFollowUp = Boolean(lead.nextFollowUpAt);
  const hasTimeline = lead.previousMessages.length > 0;

  return [
    { label: "Has a website (+15)", checked: hasWebsite },
    { label: "Has an email (+10)", checked: hasEmail },
    { label: "Has a phone (+10)", checked: hasPhone },
    { label: "Has WhatsApp (+20)", checked: hasWhatsapp },
    { label: "Category assigned (+10)", checked: hasCategory },
    { label: "City captured (+10)", checked: hasCity },
    { label: "Follow-up set (+10)", checked: hasFollowUp },
    { label: "Activity logged (+15)", checked: hasTimeline }
  ];
}

function parseCSVLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function getCSVRowObject(headers: string[], values: string[]) {
  const row: Record<string, string> = {};
  headers.forEach((header, index) => {
    row[header] = values[index] || "";
  });
  return row;
}

function getImportedCategory(row: Record<string, string>, fallback: string) {
  return row.categoryname
    || row.category_1
    || row.category_2
    || row.category_3
    || row.category_4
    || row.category_5
    || row.category_6
    || row.category_7
    || row.category_8
    || row.category_9
    || row.category_10
    || row["categories/0"]
    || row["categories/1"]
    || row["categories/2"]
    || row["categories/3"]
    || row["categories/4"]
    || row["categories/5"]
    || row["categories/6"]
    || row["categories/7"]
    || row["categories/8"]
    || row["categories/9"]
    || row.categories
    || fallback;
}

function looksLikePhone(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 10;
}

export function PipelineWorkspace({
  clients,
  campaigns,
  initialLeads,
  initialClientId = "",
  initialCampaignId = "",
  title,
  description,
  onLeadsChange
}: {
  clients: Client[];
  campaigns: Campaign[];
  initialLeads: LeadWithRelations[];
  initialClientId?: string;
  initialCampaignId?: string;
  title: string;
  description: string;
  onLeadsChange?: (updater: (current: LeadWithRelations[]) => LeadWithRelations[]) => void;
}) {
  const [leads, setLeads] = useState(initialLeads);
  const [clientId, setClientId] = useState(initialClientId);
  const [campaignId, setCampaignId] = useState(initialCampaignId);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [whatsappFilter, setWhatsappFilter] = useState<"" | WhatsAppStatus>("");
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeads[0]?.id ?? "");
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [timelineEvent, setTimelineEvent] = useState("Sent message");
  const [memoryDraft, setMemoryDraft] = useState("");
  const [clearArmed, setClearArmed] = useState(false);
  const baselineRef = useRef<Record<string, LeadWithRelations>>(
    Object.fromEntries(
      initialLeads.map((lead) => [
        lead.id,
        { ...lead, tags: [...lead.tags], previousMessages: [...lead.previousMessages] }
      ])
    )
  );
  const clearTimerRef = useRef<number | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLeads(initialLeads);
    baselineRef.current = Object.fromEntries(
      initialLeads.map((lead) => [
        lead.id,
        { ...lead, tags: [...lead.tags], previousMessages: [...lead.previousMessages] }
      ])
    );
    if (selectedLeadId && !initialLeads.some((lead) => lead.id === selectedLeadId)) {
      setSelectedLeadId("");
    }
  }, [initialLeads, selectedLeadId]);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) {
        window.clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const media = window.matchMedia("(max-width: 820px)");
    const sync = () => setIsMobileLayout(media.matches);
    sync();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", sync);
      return () => media.removeEventListener("change", sync);
    }

    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  if (!hasMounted) {
    return (
      <div className="stack pipeline-shell mobile-pipeline-shell">
        <section className="card pipeline-console mobile-pipeline-console pipeline-loading-shell">
          <div className="mobile-pipeline-toolbar">
            <div className="mobile-pipeline-tabs">
              <span className="mobile-brand">LeadOS</span>
              <span className="mobile-nav-pill active">Pipeline</span>
              <span className="mobile-nav-pill">Analytics</span>
              <span className="mobile-nav-pill">Scripts</span>
            </div>
          </div>
          <div className="mobile-filters-row">
            <div className="control-input pipeline-loading-block" />
            <div className="control-input pipeline-loading-block" />
          </div>
          <div className="pipeline-summary-chips mobile-summary-chips">
            <span className="pipeline-summary-chip muted">Loading leads</span>
          </div>
        </section>
      </div>
    );
  }

  const filteredCampaigns = useMemo(
    () => campaigns.filter((campaign) => !clientId || campaign.clientId === clientId),
    [campaigns, clientId]
  );

  const availableCategories = useMemo(
    () =>
      Array.from(
        new Set(
          leads
            .map((lead) => lead.niche?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [leads]
  );

  const visibleLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const haystack = `${lead.name} ${lead.businessName} ${lead.niche} ${lead.city} ${lead.client.name} ${lead.campaign.name}`.toLowerCase();
        return (!clientId || lead.clientId === clientId)
          && (!campaignId || lead.campaignId === campaignId)
          && (!categoryFilter || lead.niche === categoryFilter)
          && (!whatsappFilter || lead.whatsappStatus === whatsappFilter)
          && (!search || haystack.includes(search.toLowerCase()));
      }),
    [leads, clientId, campaignId, categoryFilter, whatsappFilter, search]
  );

  const pipelineSummary = useMemo(
    () => ({
      all: visibleLeads.length,
      hasWhatsApp: visibleLeads.filter((lead) => lead.whatsappStatus === "yes").length,
      noWhatsApp: visibleLeads.filter((lead) => lead.whatsappStatus === "no").length,
      unknown: visibleLeads.filter((lead) => lead.whatsappStatus === "unknown").length
    }),
    [visibleLeads]
  );

  const selectedLead = selectedLeadId
    ? visibleLeads.find((lead) => lead.id === selectedLeadId) ?? null
    : null;

  function updateLead(leadId: string, patch: Partial<LeadWithRelations>) {
    setLeads((current) => {
      const next = current.map((lead) => (lead.id === leadId ? { ...lead, ...patch } : lead));
      onLeadsChange?.(() => next);
      return next;
    });
  }

  function appendTimelineEntry(lead: LeadWithRelations, entry: string) {
    const stamped = `${entry} - ${new Date().toLocaleString()}`;
    updateLead(lead.id, {
      previousMessages: [stamped, ...lead.previousMessages],
      updatedAt: new Date().toISOString()
    });
  }

  function addMemoryLine(lead: LeadWithRelations) {
    const value = memoryDraft.trim();
    if (!value) return;
    const nextNotes = [lead.notes, `Memory: ${value}`].filter(Boolean).join("\n");
    updateLead(lead.id, { notes: nextNotes, updatedAt: new Date().toISOString() });
    setMemoryDraft("");
  }

  function resetLead(leadId: string) {
    const baseline = baselineRef.current[leadId];
    if (baseline) {
      setLeads((current) => {
        const next = current.map((lead) =>
          lead.id === leadId
            ? { ...baseline, tags: [...baseline.tags], previousMessages: [...baseline.previousMessages] }
            : lead
        );
        onLeadsChange?.(() => next);
        return next;
      });
      return;
    }

    setLeads((current) => {
      const next = current.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              leadStage: "New" as LeadStage,
              whatsappStatus: "unknown" as WhatsAppStatus,
              priority: "medium" as LeadWithRelations["priority"],
              score: 48,
              aiNextAction: "Check WhatsApp first and start the lead again from a clean state.",
              lastContactedAt: "",
              nextFollowUpAt: "",
              previousMessages: []
            }
          : lead
      );
      onLeadsChange?.(() => next);
      return next;
    });
  }

  function beginClearAllLeads() {
    if (clearArmed) {
      if (clearTimerRef.current) {
        window.clearTimeout(clearTimerRef.current);
      }
      setClearArmed(false);
      setLeads([]);
      onLeadsChange?.(() => []);
      setSelectedLeadId("");
      return;
    }

    setClearArmed(true);
    clearTimerRef.current = window.setTimeout(() => {
      setClearArmed(false);
    }, 5000);
  }

  function openCsvPicker() {
    csvInputRef.current?.click();
  }

  function importCsvFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const text = String(loadEvent.target?.result || "");
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      if (!lines.length) {
        event.target.value = "";
        return;
      }

      const headers = parseCSVLine(lines[0]).map((item) => item.trim().toLowerCase());
      const selectedClient = clients.find((client) => client.id === clientId) ?? clients[0];
      const selectedCampaign = campaigns.find((campaign) => campaign.id === campaignId)
        ?? campaigns.find((campaign) => campaign.clientId === selectedClient?.id)
        ?? campaigns[0];

      if (!selectedClient || !selectedCampaign) {
        event.target.value = "";
        return;
      }

      let added = 0;
      const importedLeads: LeadWithRelations[] = [];

      lines.slice(1).forEach((line) => {
        const clean = parseCSVLine(line);
        const row = getCSVRowObject(headers, clean);
        const name = row.title || row.name || clean[0] || "";
        if (!name) return;

        const phone = row.phone || row.phoneunformatted || row.mobile || row.telephone || "";
        const duplicate = leads.some(
          (lead) =>
            lead.businessName.toLowerCase() === name.toLowerCase()
            && (phone ? lead.phone === phone : true)
        );
        if (duplicate) return;

        const address = row.address || [row.street, row.city, row.state, row.postalcode, row.countrycode].filter(Boolean).join(", ");
        const rawCity = row.city || row.locality || row.neighborhood || "";
        const city = !phone && looksLikePhone(rawCity) ? "" : rawCity;
        const importedCategory = getImportedCategory(row, selectedClient.niche);

        const importedLead: LeadWithRelations = {
          id: `csv_${Date.now()}_${added}`,
          clientId: selectedClient.id,
          campaignId: selectedCampaign.id,
          name,
          businessName: name,
          phone,
          email: row.email || row.email_1 || "",
          address,
          city,
          niche: importedCategory,
          source: "CSV Import",
          whatsappStatus: "unknown",
          leadStage: "New",
          priority: "medium",
          tags: ["csv-import", importedCategory.toLowerCase().replace(/\s+/g, "-")],
          notes: [
            row.website ? `Website: ${row.website}` : "",
            row.email_1 ? `Email: ${row.email_1}` : "",
            address ? `Address: ${address}` : ""
          ]
            .filter(Boolean)
            .join("\n"),
          aiSummary: `${name} was imported from CSV and should be checked for WhatsApp before outreach.`,
          aiNextAction: "Check WhatsApp first, then send a short first-touch message.",
          score: 52,
          lastContactedAt: "",
          nextFollowUpAt: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          previousMessages: [],
          client: selectedClient,
          campaign: selectedCampaign
        };

        baselineRef.current[importedLead.id] = {
          ...importedLead,
          tags: [...importedLead.tags],
          previousMessages: [...importedLead.previousMessages]
        };
        importedLeads.push(importedLead);
        added += 1;
      });

      if (importedLeads.length) {
        setLeads((current) => {
          const next = [...importedLeads.reverse(), ...current];
          onLeadsChange?.(() => next);
          return next;
        });
        setSelectedLeadId(importedLeads[0].id);
      }

      event.target.value = "";
    };

    reader.readAsText(file);
  }

  const detailPanel = selectedLead ? (
    <section className={`card detail-panel legacy-detail-panel ${isMobileLayout ? "mobile-lead-sheet" : ""}`}>
      <div className="legacy-detail-header">
        <div>
          <div className="eyebrow">Lead Detail</div>
          <h2>{selectedLead.name}</h2>
        </div>
        <div className="legacy-detail-header-actions">
          <Link className="legacy-detail-link" href={`/app/leads/${selectedLead.id}`}>Open full view</Link>
          <button className="panel-close-btn" type="button" aria-label="Close lead detail" onClick={() => setSelectedLeadId("")}>x</button>
        </div>
      </div>
      <div className="legacy-action-strip">
        <a className="legacy-action-btn wa" href={buildWhatsAppUrl(selectedLead.phone)} target="_blank" rel="noreferrer">WhatsApp</a>
        <button className="legacy-action-btn wa-yes" type="button" onClick={() => updateLead(selectedLead.id, { whatsappStatus: "yes" })}>Has WA</button>
        <button className="legacy-action-btn wa-no" type="button" onClick={() => updateLead(selectedLead.id, { whatsappStatus: "no" })}>No WA</button>
        <Link className="legacy-action-btn scripts" href="/app/scripts">Scripts</Link>
        <Link className="legacy-action-btn offer" href="/app/ai">Offer</Link>
        <Link className="legacy-action-btn prep" href="/app/ai">Prep</Link>
        <Link className="legacy-action-btn ideas" href="/app/analytics">Ideas</Link>
        <button className="legacy-action-btn checklist" type="button" onClick={() => appendTimelineEntry(selectedLead, "Ran checklist")}>Checklist</button>
        <button className="legacy-action-btn lost" type="button" onClick={() => updateLead(selectedLead.id, { leadStage: "Lost" })}>Lost</button>
        <a className="legacy-action-btn maps" href={buildMapsUrl(selectedLead)} target="_blank" rel="noreferrer">Maps</a>
      </div>

      <div className="legacy-next-action">
        <div className="legacy-next-action-icon">Go</div>
        <div>
          <strong>{getLegacyActionCard(selectedLead.leadStage, selectedLead.whatsappStatus).title}</strong>
          <div className="mini-copy">{getLegacyActionCard(selectedLead.leadStage, selectedLead.whatsappStatus).description}</div>
        </div>
      </div>

      <div className="legacy-modal-section">
        <div className="detail-section-label">Momentum - {getMomentumState(selectedLead).label}</div>
        <div className="legacy-momentum-track">
          <span className={`legacy-momentum-fill ${getMomentumState(selectedLead).css}`} style={{ width: getMomentumState(selectedLead).width }} />
        </div>
      </div>

      <div className="legacy-modal-section">
        <div className="detail-section-label">Lead Info</div>
        <div className="legacy-detail-grid">
          <div className="legacy-detail-field"><div className="legacy-detail-label">Name</div><div className="legacy-detail-value">{selectedLead.name}</div></div>
          <div className="legacy-detail-field"><div className="legacy-detail-label">Niche</div><div className="legacy-detail-value">{selectedLead.niche || "-"}</div></div>
          <div className="legacy-detail-field"><div className="legacy-detail-label">Phone</div><div className="legacy-detail-value">{selectedLead.phone || "-"}</div></div>
          <div className="legacy-detail-field"><div className="legacy-detail-label">City</div><div className="legacy-detail-value">{selectedLead.city || "-"}</div></div>
          <div className="legacy-detail-field"><div className="legacy-detail-label">WhatsApp</div><div className="legacy-detail-value">{selectedLead.whatsappStatus === "yes" ? "Has WhatsApp" : selectedLead.whatsappStatus === "no" ? "No WhatsApp" : "Unknown"}</div></div>
          <div className="legacy-detail-field legacy-detail-field-full"><div className="legacy-detail-label">Address</div><div className="legacy-detail-value">{selectedLead.address || "-"}</div></div>
        </div>
      </div>

      <div className="legacy-modal-section">
        <div className="detail-section-label">Status & Priority</div>
        <div className="legacy-detail-grid">
          <div>
            <div className="legacy-detail-label">Status</div>
            <select className="control-input" value={selectedLead.leadStage} onChange={(event) => updateLead(selectedLead.id, { leadStage: event.target.value as LeadStage })}>
              {LEAD_STAGE_ORDER.map((stage) => (
                <option key={stage} value={stage}>{getLegacyStatusLabel(stage)}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="legacy-detail-label">Priority</div>
            <select className="control-input" value={getPriorityDisplay(selectedLead.priority)} onChange={(event) => updateLead(selectedLead.id, { priority: getPriorityValueFromDisplay(event.target.value) })}>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
          </div>
        </div>
      </div>

      <div className="legacy-modal-section">
        <div className="detail-section-label">Lead Score</div>
        <div className="legacy-score-wrap">
          <div className="legacy-score-header">
            <strong>{selectedLead.score}/100</strong>
            <span className={`legacy-score-state ${getMomentumState(selectedLead).css}`}>{getMomentumState(selectedLead).label}</span>
          </div>
          <div className="legacy-score-list">
            {getScoreChecklist(selectedLead).map((item) => (
              <label key={item.label} className={`legacy-score-item ${item.checked ? "checked" : ""}`}>
                <input type="checkbox" checked={item.checked} readOnly />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="legacy-modal-section">
        <div className="detail-section-label">AI Copilot</div>
        <div className="text-list">
          <div className="text-list-item"><strong>AI Summary</strong><br />{selectedLead.aiSummary}</div>
          <div className="text-list-item"><strong>AI Next Action</strong><br />{selectedLead.aiNextAction}</div>
        </div>
        <div className="button-row">
          <button className="ghost-button blue" type="button" onClick={() => updateLead(selectedLead.id, { leadStage: "Contacted" })}>Mark Contacted</button>
          <button className="ghost-button purple" type="button" onClick={() => updateLead(selectedLead.id, { leadStage: "Qualified" })}>Move Qualified</button>
          <button className="ghost-button red" type="button" onClick={() => resetLead(selectedLead.id)}>Reset Lead</button>
        </div>
      </div>

      <div className="legacy-modal-section">
        <div className="detail-section-label">Follow-Up Date</div>
        <div className="button-row">
          <input
            className="control-input"
            type="date"
            value={selectedLead.nextFollowUpAt ? new Date(selectedLead.nextFollowUpAt).toISOString().slice(0, 10) : ""}
            onChange={(event) => updateLead(selectedLead.id, { nextFollowUpAt: event.target.value ? new Date(`${event.target.value}T12:00:00`).toISOString() : "" })}
          />
          <button className="tiny-button" type="button" onClick={() => updateLead(selectedLead.id, { nextFollowUpAt: new Date().toISOString() })}>Today</button>
          <button className="tiny-button" type="button" onClick={() => updateLead(selectedLead.id, { nextFollowUpAt: new Date(Date.now() + 86400000).toISOString() })}>+1 Day</button>
        </div>
      </div>

      <div className="legacy-modal-section">
        <div className="detail-section-label">Activity Timeline</div>
        <div className="legacy-timeline-list">
          {selectedLead.previousMessages.length ? selectedLead.previousMessages.map((message, index) => (
            <div key={`${selectedLead.id}-message-${index}`} className="legacy-timeline-item">{message}</div>
          )) : <div className="mini-copy">No messages logged yet.</div>}
        </div>
        <div className="button-row">
          <select className="control-input" value={timelineEvent} onChange={(event) => setTimelineEvent(event.target.value)}>
            <option value="Sent message">Sent message</option>
            <option value="Replied">Replied</option>
            <option value="Followed up">Followed up</option>
            <option value="Ghosted">Ghosted</option>
            <option value="Booked call">Booked call</option>
          </select>
          <button className="tiny-button" type="button" onClick={() => appendTimelineEntry(selectedLead, timelineEvent)}>Log</button>
        </div>
      </div>

      <div className="legacy-modal-section">
        <div className="detail-section-label">Notes</div>
        <textarea className="notes-box compact-textarea" value={selectedLead.notes} onChange={(event) => updateLead(selectedLead.id, { notes: event.target.value })} placeholder="Add notes here..." />
      </div>

      <div className="legacy-modal-section">
        <div className="detail-section-label">Personalization Memory</div>
        <div className="button-row">
          <input className="control-input" placeholder="e.g. Owner name: Mike, has 2 locations..." value={memoryDraft} onChange={(event) => setMemoryDraft(event.target.value)} />
          <button className="tiny-button" type="button" onClick={() => addMemoryLine(selectedLead)}>+ Add</button>
        </div>
      </div>
    </section>
  ) : null;

  const renderLeadCard = (lead: LeadWithRelations, stage: LeadStage, compact = false) => (
    <article
      key={lead.id}
      className={`lead-card selectable-card ${selectedLead?.id === lead.id ? "selected-card" : ""} ${compact ? "compact-mobile-card" : ""}`}
      onClick={() => setSelectedLeadId(lead.id)}
    >
      <div className="lead-card-top">
        <div>
          <h3>{lead.businessName}</h3>
          <div className="lead-card-sub">{compact ? lead.niche : lead.client.name}</div>
        </div>
        <span className={`pill ${lead.priority === "high" ? "danger" : lead.priority === "medium" ? "info" : "muted"}`}>
          {getPriorityDisplay(lead.priority)}
        </span>
      </div>
      <div className="lead-card-sub">{compact ? (lead.phone || "No phone") : lead.campaign.name}</div>
      <div className="wa-row">
        <span className={`wa-status ${lead.whatsappStatus === "yes" ? "wa-yes" : lead.whatsappStatus === "no" ? "wa-no" : "wa-unknown"}`}>
          {lead.whatsappStatus === "yes" ? "Has WhatsApp" : lead.whatsappStatus === "no" ? "No WhatsApp" : "WA Unknown"}
        </span>
        <span className="lead-score">{lead.score}/100</span>
      </div>
      <div className="score-bar"><span style={{ width: `${lead.score}%` }} /></div>
      <div className="lead-card-sub">{getNextAction(lead.leadStage, lead.whatsappStatus)}</div>
      <div className="button-row">
        <a className="tiny-button" href={buildWhatsAppUrl(lead.phone)} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>WhatsApp</a>
        <button className="tiny-button" type="button" onClick={(event) => { event.stopPropagation(); updateLead(lead.id, { whatsappStatus: "yes" }); }}>Has WA</button>
        {!compact ? (
          <button className="tiny-button" type="button" onClick={(event) => { event.stopPropagation(); updateLead(lead.id, { leadStage: stage === "Lost" || stage === "Won" ? stage : LEAD_STAGE_ORDER[Math.min(LEAD_STAGE_ORDER.indexOf(stage) + 1, LEAD_STAGE_ORDER.length - 1)] }); }}>Advance</button>
        ) : null}
      </div>
    </article>
  );

  if (isMobileLayout) {
    return (
      <div className="stack pipeline-shell mobile-pipeline-shell">
        <section className="card pipeline-console mobile-pipeline-console">
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={importCsvFile}
          />
          <div className="mobile-pipeline-toolbar">
            <div className="mobile-pipeline-tabs">
              <span className="mobile-brand">LeadOS</span>
              <button className="mobile-nav-pill active" type="button">Pipeline</button>
              <Link className="mobile-nav-pill" href="/app/analytics">Analytics</Link>
              <Link className="mobile-nav-pill" href="/app/scripts">Scripts</Link>
            </div>
            <div className="mobile-pipeline-actions">
              <button className="mobile-icon-button" type="button" onClick={openCsvPicker}>Import</button>
              <button className={`mobile-icon-button ${clearArmed ? "danger" : ""}`} type="button" onClick={beginClearAllLeads}>
                {clearArmed ? "Confirm" : "Clear"}
              </button>
            </div>
          </div>
          <div className="mobile-filters-row">
            <select className="control-input" value={campaignId} onChange={(event) => setCampaignId(event.target.value)}>
              <option value="">All campaigns</option>
              {filteredCampaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
              ))}
            </select>
            <input
              className="control-input"
              placeholder="Search leads..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select className="control-input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="">All categories</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="pipeline-summary-chips mobile-summary-chips">
            <button className={`pipeline-summary-chip ${!whatsappFilter ? "active muted" : "muted"}`} type="button" onClick={() => setWhatsappFilter("")}>
              All Leads · {pipelineSummary.all}
            </button>
            <button className={`pipeline-summary-chip success ${whatsappFilter === "yes" ? "active" : ""}`} type="button" onClick={() => setWhatsappFilter("yes")}>
              Has WhatsApp · {pipelineSummary.hasWhatsApp}
            </button>
            <button className={`pipeline-summary-chip danger ${whatsappFilter === "no" ? "active" : ""}`} type="button" onClick={() => setWhatsappFilter("no")}>
              No WhatsApp · {pipelineSummary.noWhatsApp}
            </button>
            <button className={`pipeline-summary-chip warning ${whatsappFilter === "unknown" ? "active" : ""}`} type="button" onClick={() => setWhatsappFilter("unknown")}>
              Unknown · {pipelineSummary.unknown}
            </button>
          </div>
        </section>

        <section className="mobile-stage-area">
          <div className="mobile-stage-scroll">
            {LEAD_STAGE_ORDER.map((stage) => {
              const stageLeads = visibleLeads.filter((lead) => lead.leadStage === stage);
              return (
                <section key={stage} className="mobile-stage-column">
                  <div className="mobile-stage-header">
                    <span>{getLegacyStatusLabel(stage).toUpperCase()}</span>
                    <strong>{stageLeads.length}</strong>
                  </div>
                  <div className="mobile-stage-stack">
                    {stageLeads.length === 0 ? (
                      <div className="empty-state compact-empty-state"><div className="mini-copy">No leads</div></div>
                    ) : (
                      stageLeads.map((lead) => renderLeadCard(lead, stage, true))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        {selectedLead ? (
          <div className="mobile-lead-overlay" onClick={() => setSelectedLeadId("")}>
            <div className="mobile-lead-sheet-wrap" onClick={(event) => event.stopPropagation()}>
              {detailPanel}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="stack pipeline-shell">
      <section className="card page-title pipeline-console">
        <div className="eyebrow">Pipeline</div>
        <h1>{title}</h1>
        <p>{description}</p>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={importCsvFile}
        />
        <div className="button-row toolbar-actions">
          <button className="ghost-button primary" type="button" onClick={openCsvPicker}>
            CSV Import
          </button>
          <button className="ghost-button red" type="button" onClick={beginClearAllLeads}>
            {clearArmed ? "Tap Again to Clear All Leads" : "Clear All Leads"}
          </button>
          {selectedLead ? (
            <button className="ghost-button red" type="button" onClick={() => resetLead(selectedLead.id)}>
              Reset Lead
            </button>
          ) : null}
        </div>
        <div className="toolbar-grid four-up">
          <select className="control-input" value={clientId} onChange={(event) => { setClientId(event.target.value); setCampaignId(""); }}>
            <option value="">All clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <select className="control-input" value={campaignId} onChange={(event) => setCampaignId(event.target.value)}>
            <option value="">All campaigns</option>
            {filteredCampaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
          </select>
          <select className="control-input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="">All categories</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            className="control-input"
            placeholder="Search leads, businesses, cities"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="pipeline-summary-chips">
          <button className={`pipeline-summary-chip ${!whatsappFilter ? "active muted" : "muted"}`} type="button" onClick={() => setWhatsappFilter("")}>
            All Leads · {pipelineSummary.all}
          </button>
          <button className={`pipeline-summary-chip success ${whatsappFilter === "yes" ? "active" : ""}`} type="button" onClick={() => setWhatsappFilter("yes")}>
            Has WhatsApp · {pipelineSummary.hasWhatsApp}
          </button>
          <button className={`pipeline-summary-chip danger ${whatsappFilter === "no" ? "active" : ""}`} type="button" onClick={() => setWhatsappFilter("no")}>
            No WhatsApp · {pipelineSummary.noWhatsApp}
          </button>
          <button className={`pipeline-summary-chip warning ${whatsappFilter === "unknown" ? "active" : ""}`} type="button" onClick={() => setWhatsappFilter("unknown")}>
            Unknown · {pipelineSummary.unknown}
          </button>
        </div>
        <div className="inline-stat">
          <strong>{visibleLeads.length}</strong>
          <span>Visible leads</span>
        </div>
        <div className="csv-import-panel">
          <span className="mini-copy">CSV import follows the old LeadOS pattern: choose a `.csv` file, map common headers like `title`, `phone`, `city`, and `categoryName`, skip duplicates, and import into the current client/campaign context.</span>
          <span className="mini-copy">`Clear All Leads` uses the same two-tap safety idea as the original reset flow, so you can wipe the current board and reimport fresh leads.</span>
        </div>
      </section>

      <section className="workspace-grid pipeline-workspace-grid">
        <div className="stack pipeline-main-stack">
          <section className="card pipeline-board-card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Stage board</div>
                <h2>Move fast, stay clear</h2>
              </div>
              <span>WhatsApp-first, stage-aware, campaign-aware</span>
            </div>
            <div className="lead-board lead-board-seven pipeline-board-scroll">
              {LEAD_STAGE_ORDER.map((stage) => {
                const stageLeads = visibleLeads.filter((lead) => lead.leadStage === stage);
                return (
                  <section key={stage} className="lead-column">
                    <div className="lead-column-header">
                      <div className="lead-column-title">{stage}</div>
                      <span>{stageLeads.length}</span>
                    </div>
                    {stageLeads.length === 0 ? (
                      <div className="empty-state"><div className="mini-copy">No leads here yet.</div></div>
                    ) : (
                      stageLeads.map((lead) => renderLeadCard(lead, stage))
                    )}
                  </section>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="stack">
          {detailPanel}
        </aside>
      </section>
    </div>
  );
}
