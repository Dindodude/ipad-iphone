"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppState } from "@/components/app-state-provider";
import { getActivityForLeadFromSnapshot, getLeadWithRelations } from "@/lib/snapshot-helpers";

function buildWhatsAppUrl(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

export default function LeadDetailPage() {
  const params = useParams<{ leadId: string }>();
  const { snapshot, ready } = useAppState();
  const lead = params?.leadId ? getLeadWithRelations(snapshot, params.leadId) : null;
  const activity = params?.leadId ? getActivityForLeadFromSnapshot(snapshot, params.leadId) : [];

  if (!ready) {
    return (
      <section className="card empty-state">
        <h1>Loading lead...</h1>
        <p>LeadOS is loading your saved workspace.</p>
      </section>
    );
  }

  if (!lead) {
    return (
      <section className="card empty-state">
        <h1>Lead not found</h1>
        <p>This lead id is not available in the current saved LeadOS workspace.</p>
      </section>
    );
  }

  return (
    <div className="stack">
      <section className="page-title card">
        <div className="eyebrow">Lead Detail</div>
        <h1>{lead.name}</h1>
        <p>{lead.client.name} / {lead.campaign.name} / {lead.niche}</p>
        <div className="button-row">
          <a className="button" href={buildWhatsAppUrl(lead.phone)} target="_blank" rel="noreferrer">Open in WhatsApp</a>
          <Link href="/app/ai" className="button-secondary">Generate first message</Link>
          <Link href="/app/ai" className="button-secondary">Generate follow-up</Link>
          <Link href="/app/pipeline" className="button-secondary">Back to pipeline</Link>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="stack">
          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Lead command view</div>
                <h2>Everything needed to work this lead</h2>
              </div>
            </div>
            <div className="mini-grid">
              <div className="mini-card"><strong>Client</strong><p>{lead.client.name}</p></div>
              <div className="mini-card"><strong>Campaign</strong><p>{lead.campaign.name}</p></div>
              <div className="mini-card"><strong>Phone</strong><p>{lead.phone || "-"}</p></div>
              <div className="mini-card"><strong>Email</strong><p>{lead.email || "-"}</p></div>
              <div className="mini-card"><strong>Business Type</strong><p>{lead.niche}</p></div>
              <div className="mini-card"><strong>Source</strong><p>{lead.source}</p></div>
              <div className="mini-card"><strong>Stage</strong><p>{lead.leadStage}</p></div>
              <div className="mini-card"><strong>WhatsApp</strong><p>{lead.whatsappStatus === "yes" ? "Has WhatsApp" : lead.whatsappStatus === "no" ? "No WhatsApp" : "Unknown"}</p></div>
              <div className="mini-card"><strong>Follow-up</strong><p>{lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleDateString() : "Not set"}</p></div>
              <div className="mini-card"><strong>Tags</strong><p>{lead.tags.join(", ") || "-"}</p></div>
              <div className="mini-card"><strong>Address</strong><p>{lead.address || "-"}</p></div>
              <div className="mini-card"><strong>Score</strong><p>{lead.score}/100</p></div>
            </div>
          </section>

          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Notes</div>
                <h2>Lead intelligence</h2>
              </div>
            </div>
            <div className="text-list">
              <div className="text-list-item">{lead.notes || "No notes yet."}</div>
              {lead.previousMessages.map((message, index) => (
                <div key={`${lead.id}-message-${index}`} className="text-list-item">{message}</div>
              ))}
            </div>
          </section>
        </div>

        <aside className="stack">
          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">AI outputs</div>
                <h2>Copilot guidance</h2>
              </div>
            </div>
            <div className="button-row">
              <a className="ghost-button primary" href={buildWhatsAppUrl(lead.phone)} target="_blank" rel="noreferrer">Open WhatsApp</a>
              <Link href="/app/ai" className="ghost-button purple">Move Qualified</Link>
            </div>
            <div className="text-list">
              <div className="text-list-item"><strong>AI Summary</strong><br />{lead.aiSummary}</div>
              <div className="text-list-item"><strong>Next Action</strong><br />{lead.aiNextAction}</div>
            </div>
          </section>

          <section className="card">
            <div className="section-head">
              <div>
                <div className="eyebrow">Timeline</div>
                <h2>Activity log</h2>
              </div>
            </div>
            <div className="text-list">
              {activity.length ? activity.map((item) => (
                <div key={item.id} className="text-list-item">
                  <strong>{item.type}</strong>
                  <br />
                  {item.content}
                </div>
              )) : <div className="text-list-item">No activity recorded for this lead yet.</div>}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
