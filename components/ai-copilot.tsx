"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/components/app-state-provider";
import type { AiTask } from "@/lib/types";

const taskOptions: Array<{ value: AiTask; label: string }> = [
  { value: "first-message", label: "First Message" },
  { value: "follow-up", label: "Follow Up" },
  { value: "lead-summary", label: "Lead Summary" },
  { value: "next-action", label: "Next Action" },
  { value: "rank-leads", label: "Rank Leads" },
  { value: "niche-offer", label: "Niche Offer" },
  { value: "improve-outreach", label: "Improve Outreach" }
];

export function AICopilot() {
  const { snapshot } = useAppState();
  const { clients, campaigns, leads } = snapshot;
  const [task, setTask] = useState<AiTask>("next-action");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [campaignId, setCampaignId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("AI chat ready. Pick context, ask for what you need, and use it like a real outreach copilot.");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const availableCampaigns = useMemo(
    () => campaigns.filter((campaign) => !clientId || campaign.clientId === clientId),
    [campaigns, clientId]
  );
  const availableLeads = useMemo(
    () => leads.filter((lead) => (!clientId || lead.clientId === clientId) && (!campaignId || lead.campaignId === campaignId)),
    [leads, clientId, campaignId]
  );

  const selectedLead = leads.find((lead) => lead.id === leadId);
  const selectedClient = clients.find((client) => client.id === (selectedLead?.clientId || clientId));
  const selectedCampaign = campaigns.find((campaign) => campaign.id === (selectedLead?.campaignId || campaignId));

  async function runTask() {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          prompt,
          clientName: selectedClient?.name ?? "",
          campaignName: selectedCampaign?.name ?? "",
          leadName: selectedLead?.name ?? "",
          businessName: selectedLead?.businessName ?? "",
          niche: selectedLead?.niche ?? selectedClient?.niche ?? "",
          stage: selectedLead?.leadStage ?? selectedCampaign?.defaultStage ?? "",
          whatsappStatus: selectedLead?.whatsappStatus ?? "",
          notes: selectedLead?.notes ?? "",
          city: selectedLead?.city ?? ""
        })
      });

      const data = await response.json();
      setOutput(data.text || "No response returned.");
    } catch {
      setOutput("The copilot could not respond just now. Try again with a simpler prompt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="ai-chat-trigger" type="button" onClick={() => setOpen(true)}>
        <span className="ai-chat-full-label">AI Chat</span>
        <span className="ai-chat-short-label">AI</span>
      </button>

      {open ? (
        <div className="copilot-overlay" onClick={() => setOpen(false)}>
          <aside className="copilot-shell open" onClick={(event) => event.stopPropagation()}>
            <section className="card copilot-card">
              <div className="section-head">
                <div>
                  <div className="eyebrow">AI Assistant</div>
                  <h2>Sales copilot</h2>
                </div>
                <div className="button-row">
                  <span className="mini-copy">Global</span>
                  <button className="tiny-button" type="button" onClick={() => setOpen(false)}>Close</button>
                </div>
              </div>

              <div className="copilot-grid">
                <select className="control-input" value={task} onChange={(event) => setTask(event.target.value as AiTask)}>
                  {taskOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select className="control-input" value={clientId} onChange={(event) => { setClientId(event.target.value); setCampaignId(""); setLeadId(""); }}>
                  <option value="">All clients</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <select className="control-input" value={campaignId} onChange={(event) => { setCampaignId(event.target.value); setLeadId(""); }}>
                  <option value="">All campaigns</option>
                  {availableCampaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                  ))}
                </select>
                <select className="control-input" value={leadId} onChange={(event) => setLeadId(event.target.value)}>
                  <option value="">No lead selected</option>
                  {availableLeads.slice(0, 12).map((lead) => (
                    <option key={lead.id} value={lead.id}>{lead.name}</option>
                  ))}
                </select>
                <textarea
                  className="notes-box copilot-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask the copilot to write, rank, summarize, or improve something."
                />
                <div className="button-row">
                  <button className="ghost-button primary" type="button" onClick={runTask}>
                    {loading ? "Thinking..." : "Run AI"}
                  </button>
                  <button className="tiny-button" type="button" onClick={() => setPrompt("Generate a short WhatsApp-ready first message.")}>
                    First message
                  </button>
                  <button className="tiny-button" type="button" onClick={() => setPrompt("Suggest the next best action based on the stage and notes.")}>
                    Next action
                  </button>
                </div>
              </div>

              <div className="copilot-output">
                <div className="eyebrow">Output</div>
                <div className="script-body">{output}</div>
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </>
  );
}
