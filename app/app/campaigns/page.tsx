"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { DashboardCard } from "@/components/dashboard-card";
import { useAppState } from "@/components/app-state-provider";
import { createCampaign, deleteCampaign } from "@/lib/actions";
import { getCampaignSummariesFromSnapshot } from "@/lib/snapshot-helpers";

type CampaignFormState = {
  name: string;
  source: string;
  clientId: string;
  description: string;
};

type CampaignFormErrors = Partial<Record<keyof CampaignFormState | "form", string>>;

const CAMPAIGN_SOURCES = [
  "CSV Import",
  "Facebook Leads",
  "Instant Form",
  "Missed Calls",
  "Reactivation",
  "Seasonal",
  "Other"
] as const;

const EMPTY_FORM: CampaignFormState = {
  name: "",
  source: CAMPAIGN_SOURCES[0],
  clientId: "",
  description: ""
};

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export default function CampaignsPage() {
  const { snapshot, updateSnapshot } = useAppState();
  const campaigns = getCampaignSummariesFromSnapshot(snapshot);
  const clients = useMemo(
    () => [...snapshot.clients].sort((a, b) => a.name.localeCompare(b.name)),
    [snapshot.clients]
  );
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignFormState>(() => ({
    ...EMPTY_FORM,
    clientId: snapshot.clients[0]?.id ?? ""
  }));
  const [errors, setErrors] = useState<CampaignFormErrors>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 820px)");
    const sync = () => setIsMobile(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (form.clientId || !clients[0]?.id) return;
    setForm((current) => ({ ...current, clientId: clients[0].id }));
  }, [clients, form.clientId]);

  function openForm() {
    setErrors({});
    setForm((current) => ({
      ...current,
      clientId: current.clientId || clients[0]?.id || ""
    }));
    setShowForm(true);
  }

  function closeForm() {
    if (isPending) return;
    setShowForm(false);
    setForm({
      ...EMPTY_FORM,
      clientId: clients[0]?.id ?? ""
    });
    setErrors({});
  }

  function setField<K extends keyof CampaignFormState>(field: K, value: CampaignFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  function validateForm() {
    const nextErrors: CampaignFormErrors = {};
    if (!normalizeName(form.name)) {
      nextErrors.name = "Campaign name is required.";
    }
    if (!form.source.trim()) {
      nextErrors.source = "Source is required.";
    }
    if (!form.clientId.trim()) {
      nextErrors.clientId = "Choose a client first.";
    }
    const duplicate = snapshot.campaigns.some((campaign) =>
      campaign.clientId === form.clientId &&
      campaign.name.trim().toLowerCase() === normalizeName(form.name).toLowerCase()
    );
    if (duplicate) {
      nextErrors.name = "That client already has a campaign with this name.";
    }
    return nextErrors;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    startTransition(async () => {
      const result = await createCampaign({
        name: form.name,
        source: form.source,
        clientId: form.clientId,
        description: form.description
      });

      if (!result.ok) {
        setErrors((current) => ({
          ...current,
          form: result.error,
          name: result.error.toLowerCase().includes("campaign") ? result.error : current.name
        }));
        return;
      }

      updateSnapshot((current) => ({
        ...current,
        campaigns: [result.data, ...current.campaigns]
      }));

      setErrors({});
      setShowForm(false);
      setForm({
        ...EMPTY_FORM,
        clientId: clients[0]?.id ?? ""
      });
    });
  }

  function handleDelete(campaignId: string) {
    startTransition(async () => {
      const result = await deleteCampaign(campaignId);
      if (!result.ok) {
        setErrors({ form: result.error });
        return;
      }

      updateSnapshot((current) => {
        const removedLeadIds = new Set(current.leads.filter((lead) => lead.campaignId === campaignId).map((lead) => lead.id));
        return {
          ...current,
          campaigns: current.campaigns.filter((campaign) => campaign.id !== campaignId),
          leads: current.leads.filter((lead) => lead.campaignId !== campaignId),
          forms: current.forms.filter((formItem) => formItem.campaignId !== campaignId),
          scripts: current.scripts.filter((script) => script.campaignId !== campaignId),
          activityLogs: current.activityLogs.filter((log) => !removedLeadIds.has(log.leadId))
        };
      });

      setConfirmingDeleteId(null);
      setErrors({});
    });
  }

  const formCard = (
    <section className="card entry-form-card">
      <div className="entry-form-head">
        <div>
          <div className="eyebrow">New Campaign</div>
          <h2>Create a campaign inside a client.</h2>
        </div>
        <button type="button" className="ghost-button" onClick={closeForm}>Cancel</button>
      </div>
      <form className="entry-form-body" onSubmit={handleSubmit}>
        <label className="field-stack">
          <span>Campaign name</span>
          <input
            className={`control-input${errors.name ? " input-error" : ""}`}
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            placeholder="Spring Reactivation"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <small className="field-error">{errors.name}</small> : null}
        </label>
        <div className="entry-form-grid">
          <label className="field-stack">
            <span>Source or type</span>
            <select
              className={`control-input${errors.source ? " input-error" : ""}`}
              value={form.source}
              onChange={(event) => setField("source", event.target.value)}
              aria-invalid={Boolean(errors.source)}
            >
              {CAMPAIGN_SOURCES.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
            {errors.source ? <small className="field-error">{errors.source}</small> : null}
          </label>
          <label className="field-stack">
            <span>Client</span>
            <select
              className={`control-input${errors.clientId ? " input-error" : ""}`}
              value={form.clientId}
              onChange={(event) => setField("clientId", event.target.value)}
              aria-invalid={Boolean(errors.clientId)}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            {errors.clientId ? <small className="field-error">{errors.clientId}</small> : null}
          </label>
        </div>
        <label className="field-stack">
          <span>Description</span>
          <textarea
            className="notes-box compact-textarea"
            value={form.description}
            onChange={(event) => setField("description", event.target.value)}
            placeholder="Optional context for where this campaign comes from and how the offer should be positioned."
          />
        </label>
        {errors.form ? <div className="field-error form-error">{errors.form}</div> : null}
        <div className="button-row entry-form-actions">
          <button type="submit" className="button" disabled={isPending}>{isPending ? "Creating..." : "Create campaign"}</button>
          <button type="button" className="ghost-button" onClick={closeForm} disabled={isPending}>Cancel</button>
        </div>
      </form>
    </section>
  );

  return (
    <div className="stack">
      <section className="page-title card">
        <div className="page-title-top">
          <div>
            <div className="eyebrow">Campaigns</div>
            <h1>Separate source buckets without losing control.</h1>
            <p>Use campaigns and groups to organize missed calls, Facebook leads, instant forms, quote requests, and seasonal offers inside each client.</p>
          </div>
          <div className="page-title-actions">
            <button type="button" className="button" onClick={openForm} disabled={!clients.length}>New Campaign</button>
          </div>
        </div>
      </section>

      {showForm && !isMobile ? formCard : null}

      {showForm && isMobile ? (
        <div className="mobile-lead-overlay" role="dialog" aria-modal="true">
          <div className="mobile-lead-sheet-wrap">
            <div className="mobile-lead-sheet entry-form-sheet">{formCard}</div>
          </div>
        </div>
      ) : null}

      {!clients.length ? (
        <section className="card empty-state">
          <div className="empty-state-icon">+</div>
          <strong>No clients yet</strong>
          <p className="mini-copy">Create a client first so campaigns have somewhere real to live.</p>
        </section>
      ) : null}

      {clients.length > 0 && campaigns.length === 0 && !showForm ? (
        <section className="card empty-state">
          <div className="empty-state-icon">+</div>
          <strong>No campaigns yet</strong>
          <p className="mini-copy">Create your first campaign to organize source buckets, offers, and new lead inflow for a client.</p>
          <button type="button" className="button" onClick={openForm}>Create your first campaign</button>
        </section>
      ) : null}

      {errors.form && !showForm ? <section className="card form-banner-error">{errors.form}</section> : null}

      {campaigns.length > 0 ? (
        <section className="dashboard-grid">
          {campaigns.map((summary) => (
            <DashboardCard
              key={summary.campaign.id}
              summary={summary}
              confirmingDelete={confirmingDeleteId === summary.campaign.id}
              onDeleteRequest={() => setConfirmingDeleteId(summary.campaign.id)}
              onDeleteConfirm={() => handleDelete(summary.campaign.id)}
              onDeleteCancel={() => setConfirmingDeleteId(null)}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}
