"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useAppState } from "@/components/app-state-provider";
import { createClient, deleteClient } from "@/lib/actions";
import { getClientSummariesFromSnapshot } from "@/lib/snapshot-helpers";

type ClientFormState = {
  name: string;
  niche: string;
  notes: string;
};

type ClientFormErrors = Partial<Record<keyof ClientFormState | "form", string>>;

const EMPTY_FORM: ClientFormState = {
  name: "",
  niche: "",
  notes: ""
};

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export default function ClientsPage() {
  const { snapshot, updateSnapshot } = useAppState();
  const summaries = getClientSummariesFromSnapshot(snapshot);
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 820px)");
    const sync = () => setIsMobile(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  const hasClients = summaries.length > 0;

  function openForm() {
    setErrors({});
    setShowForm(true);
  }

  function closeForm() {
    if (isPending) return;
    setShowForm(false);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function setField<K extends keyof ClientFormState>(field: K, value: ClientFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  function validateForm() {
    const nextErrors: ClientFormErrors = {};
    if (!normalizeName(form.name)) {
      nextErrors.name = "Client name is required.";
    }
    if (!normalizeName(form.niche)) {
      nextErrors.niche = "Niche or industry is required.";
    }
    const duplicate = snapshot.clients.some((client) => client.name.trim().toLowerCase() === normalizeName(form.name).toLowerCase());
    if (duplicate) {
      nextErrors.name = "A client with that name already exists.";
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
      const result = await createClient({
        name: form.name,
        niche: form.niche,
        notes: form.notes
      });

      if (!result.ok) {
        setErrors((current) => ({
          ...current,
          form: result.error,
          name: result.error.toLowerCase().includes("already exists") ? result.error : current.name
        }));
        return;
      }

      updateSnapshot((current) => ({
        ...current,
        clients: [result.data, ...current.clients]
      }));

      setForm(EMPTY_FORM);
      setErrors({});
      setShowForm(false);
    });
  }

  function handleDelete(clientId: string) {
    startTransition(async () => {
      const result = await deleteClient(clientId);
      if (!result.ok) {
        setErrors({ form: result.error });
        return;
      }

      updateSnapshot((current) => {
        const removedLeadIds = new Set(current.leads.filter((lead) => lead.clientId === clientId).map((lead) => lead.id));
        return {
          ...current,
          clients: current.clients.filter((client) => client.id !== clientId),
          campaigns: current.campaigns.filter((campaign) => campaign.clientId !== clientId),
          leads: current.leads.filter((lead) => lead.clientId !== clientId),
          forms: current.forms.filter((formItem) => formItem.clientId !== clientId),
          scripts: current.scripts.filter((script) => script.clientId !== clientId),
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
          <div className="eyebrow">New Client</div>
          <h2>Create a new client record.</h2>
        </div>
        <button type="button" className="ghost-button" onClick={closeForm}>Cancel</button>
      </div>
      <form className="entry-form-body" onSubmit={handleSubmit}>
        <label className="field-stack">
          <span>Client name</span>
          <input
            className={`control-input${errors.name ? " input-error" : ""}`}
            value={form.name}
            onChange={(event) => setField("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            placeholder="Acme Roofing"
          />
          {errors.name ? <small className="field-error">{errors.name}</small> : null}
        </label>
        <label className="field-stack">
          <span>Niche or industry</span>
          <input
            className={`control-input${errors.niche ? " input-error" : ""}`}
            value={form.niche}
            onChange={(event) => setField("niche", event.target.value)}
            aria-invalid={Boolean(errors.niche)}
            placeholder="Roofing"
          />
          {errors.niche ? <small className="field-error">{errors.niche}</small> : null}
        </label>
        <label className="field-stack">
          <span>Notes</span>
          <textarea
            className="notes-box compact-textarea"
            value={form.notes}
            onChange={(event) => setField("notes", event.target.value)}
            placeholder="Optional client context, retainer notes, team details, or channel preferences."
          />
        </label>
        {errors.form ? <div className="field-error form-error">{errors.form}</div> : null}
        <div className="button-row entry-form-actions">
          <button type="submit" className="button" disabled={isPending}>{isPending ? "Creating..." : "Create client"}</button>
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
            <div className="eyebrow">Clients</div>
            <h1>Manage every paying business you service.</h1>
            <p>Each client holds campaigns, lead flow, notes, performance context, and outreach execution in one clean layer.</p>
          </div>
          <div className="page-title-actions">
            <button type="button" className="button" onClick={openForm}>New Client</button>
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

      {!hasClients && !showForm ? (
        <section className="card empty-state">
          <div className="empty-state-icon">+</div>
          <strong>No clients yet</strong>
          <p className="mini-copy">Create your first client to start organizing campaigns, leads, and outreach under one business.</p>
          <button type="button" className="button" onClick={openForm}>Create your first client</button>
        </section>
      ) : null}

      {errors.form && !showForm ? <section className="card form-banner-error">{errors.form}</section> : null}

      {hasClients ? (
        <section className="dashboard-grid">
          {summaries.map((summary) => (
            <article key={summary.client.id} className="card dashboard-card">
              <div className="card-actions-top">
                <div className="card-chip">{summary.client.niche}</div>
                {confirmingDeleteId === summary.client.id ? (
                  <div className="card-delete-confirm">
                    <button type="button" className="ghost-button red card-delete-mini" onClick={() => handleDelete(summary.client.id)}>Confirm</button>
                    <button type="button" className="ghost-button card-delete-mini" onClick={() => setConfirmingDeleteId(null)}>Cancel</button>
                  </div>
                ) : (
                  <button type="button" className="card-delete-button" aria-label={`Delete ${summary.client.name}`} onClick={() => setConfirmingDeleteId(summary.client.id)}>×</button>
                )}
              </div>
              <h3>{summary.client.name}</h3>
              <p>{summary.client.notes || "No notes yet. Add campaign context, offer details, or outreach instructions for this client."}</p>
              <div className="meta-stack">
                <div className="meta-row"><span>Campaigns</span><strong>{summary.campaignCount}</strong></div>
                <div className="meta-row"><span>Leads</span><strong>{summary.leadCount}</strong></div>
                <div className="meta-row"><span>Hot</span><strong>{summary.hotLeadCount}</strong></div>
                <div className="meta-row"><span>Won</span><strong>{summary.wonCount}</strong></div>
              </div>
              <div className="button-row">
                <Link href="/app/campaigns" className="tiny-button">View campaigns</Link>
                <Link href="/app/pipeline" className="tiny-button">Open pipeline</Link>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
