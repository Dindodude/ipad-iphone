import {
  mockActivityLogs,
  mockCampaigns,
  mockCategories,
  mockClients,
  mockForms,
  mockLeads,
  mockScripts
} from "@/lib/mock-data";
import type {
  ActivityLog,
  AnalyticsSummary,
  AppSnapshot,
  Campaign,
  CampaignSummary,
  Category,
  Client,
  ClientSummary,
  DashboardOverview,
  FormDefinition,
  Lead,
  LeadStage,
  LeadWithRelations,
  Script
} from "@/lib/types";
import { LEAD_STAGE_ORDER } from "@/lib/types";

function safeDateValue(value?: string) {
  return value ? new Date(value).getTime() : 0;
}

export function getLeadScore(lead: Lead) {
  let score = 28;
  if (lead.phone) score += 10;
  if (lead.email) score += 6;
  if (lead.whatsappStatus === "yes") score += 18;
  if (lead.leadStage === "Replied") score += 16;
  if (lead.leadStage === "Interested") score += 22;
  if (lead.leadStage === "Qualified") score += 28;
  if (lead.leadStage === "Won") score += 32;
  if (lead.priority === "high") score += 18;
  if (lead.priority === "medium") score += 8;
  if (lead.nextFollowUpAt && safeDateValue(lead.nextFollowUpAt) <= safeDateValue("2026-04-18T00:00:00.000Z")) {
    score += 8;
  }
  return Math.min(score, 100);
}

function withLeadRelations(lead: Lead): LeadWithRelations {
  const client = mockClients.find((item) => item.id === lead.clientId)!;
  const campaign = mockCampaigns.find((item) => item.id === lead.campaignId)!;
  return { ...lead, client, campaign };
}

function getClientSummary(client: Client): ClientSummary {
  const campaigns = mockCampaigns.filter((campaign) => campaign.clientId === client.id);
  const leads = mockLeads.filter((lead) => lead.clientId === client.id);
  return {
    client,
    campaignCount: campaigns.length,
    leadCount: leads.length,
    hotLeadCount: leads.filter((lead) => lead.priority === "high").length,
    wonCount: leads.filter((lead) => lead.leadStage === "Won").length,
    repliedCount: leads.filter((lead) => lead.leadStage === "Replied").length,
    whatsappReadyCount: leads.filter((lead) => lead.whatsappStatus === "yes").length
  };
}

function getCampaignSummary(campaign: Campaign): CampaignSummary {
  const client = mockClients.find((item) => item.id === campaign.clientId)!;
  const leads = mockLeads.filter((lead) => lead.campaignId === campaign.id);
  const repliedCount = leads.filter((lead) =>
    lead.leadStage === "Replied" || lead.leadStage === "Interested" || lead.leadStage === "Qualified" || lead.leadStage === "Won"
  ).length;

  return {
    campaign,
    client,
    leadCount: leads.length,
    qualifiedCount: leads.filter((lead) => lead.leadStage === "Qualified").length,
    wonCount: leads.filter((lead) => lead.leadStage === "Won").length,
    followUpDueCount: leads.filter((lead) => lead.nextFollowUpAt && safeDateValue(lead.nextFollowUpAt) <= safeDateValue("2026-04-18T23:59:59.999Z")).length,
    replyRate: leads.length ? Math.round((repliedCount / leads.length) * 100) : 0
  };
}

export async function getClients(): Promise<Client[]> {
  return mockClients;
}

export async function getClientById(clientId: string): Promise<Client | null> {
  return mockClients.find((client) => client.id === clientId) ?? null;
}

export async function getCampaigns(): Promise<Campaign[]> {
  return mockCampaigns;
}

export async function getCampaignsByClientId(clientId: string): Promise<Campaign[]> {
  return mockCampaigns.filter((campaign) => campaign.clientId === clientId);
}

export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  return mockCampaigns.find((campaign) => campaign.id === campaignId) ?? null;
}

export async function getLeads(): Promise<Lead[]> {
  return mockLeads.map((lead) => ({ ...lead, score: getLeadScore(lead) }));
}

export async function getLeadById(leadId: string): Promise<LeadWithRelations | null> {
  const lead = mockLeads.find((item) => item.id === leadId);
  return lead ? withLeadRelations({ ...lead, score: getLeadScore(lead) }) : null;
}

export async function getLeadsByClientId(clientId: string): Promise<LeadWithRelations[]> {
  return (await getLeads())
    .filter((lead) => lead.clientId === clientId)
    .map(withLeadRelations);
}

export async function getLeadsByCampaignId(campaignId: string): Promise<LeadWithRelations[]> {
  return (await getLeads())
    .filter((lead) => lead.campaignId === campaignId)
    .map(withLeadRelations);
}

export async function getScripts(): Promise<Script[]> {
  return mockScripts;
}

export async function getScriptsForCampaign(campaignId: string): Promise<Script[]> {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) return [];
  return mockScripts.filter((script) =>
    script.campaignId === campaignId || script.clientId === campaign.clientId || (!script.clientId && !script.campaignId)
  );
}

export async function getForms(): Promise<FormDefinition[]> {
  return mockForms;
}

export async function getFormsForClient(clientId: string): Promise<FormDefinition[]> {
  return mockForms.filter((form) => form.clientId === clientId);
}

export async function getCategories(): Promise<Category[]> {
  return mockCategories;
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  return mockActivityLogs.sort((a, b) => safeDateValue(b.createdAt) - safeDateValue(a.createdAt));
}

export async function getActivityForLead(leadId: string): Promise<ActivityLog[]> {
  return mockActivityLogs
    .filter((activity) => activity.leadId === leadId)
    .sort((a, b) => safeDateValue(b.createdAt) - safeDateValue(a.createdAt));
}

export async function getClientSummaries(): Promise<ClientSummary[]> {
  return mockClients.map(getClientSummary).sort((a, b) => b.leadCount - a.leadCount);
}

export async function getCampaignSummaries(): Promise<CampaignSummary[]> {
  return mockCampaigns.map(getCampaignSummary).sort((a, b) => b.leadCount - a.leadCount);
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const leads = await getLeads();
  const clientSummaries = await getClientSummaries();
  const campaignSummaries = await getCampaignSummaries();
  const activities = await getActivityLogs();

  return {
    totalLeads: leads.length,
    newLeads: leads.filter((lead) => lead.leadStage === "New").length,
    leadsNeedingFollowUp: leads.filter((lead) => lead.nextFollowUpAt && safeDateValue(lead.nextFollowUpAt) <= safeDateValue("2026-04-18T23:59:59.999Z")).length,
    hotLeads: leads.filter((lead) => lead.priority === "high").length,
    repliedLeads: leads.filter((lead) => lead.leadStage === "Replied").length,
    closedLeads: leads.filter((lead) => lead.leadStage === "Won").length,
    whatsappReadyLeads: leads.filter((lead) => lead.whatsappStatus === "yes").length,
    topPerformingClient: clientSummaries[0],
    topPerformingCampaign: campaignSummaries[0],
    recentActivity: activities.slice(0, 6).map((activity) => ({
      ...activity,
      leadName: mockLeads.find((lead) => lead.id === activity.leadId)?.name ?? "Unknown lead"
    })),
    aiSuggestions: [
      "Focus WhatsApp-first on qualified and replied leads with follow-up due in the next 24 hours.",
      "Use the real estate reactivation campaign as your AI testing ground for softer follow-ups.",
      "Turn the won detailing client into proof content and reuse that angle for the seasonal detailing campaign."
    ]
  };
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const leads = await getLeads();
  const stageCounts = LEAD_STAGE_ORDER.reduce<Record<LeadStage, number>>((acc, stage) => {
    acc[stage] = leads.filter((lead) => lead.leadStage === stage).length;
    return acc;
  }, {
    New: 0,
    Contacted: 0,
    Replied: 0,
    Interested: 0,
    Qualified: 0,
    Won: 0,
    Lost: 0
  });

  const repliedish = leads.filter((lead) =>
    lead.leadStage === "Replied" || lead.leadStage === "Interested" || lead.leadStage === "Qualified" || lead.leadStage === "Won"
  ).length;
  const followUpCount = leads.filter((lead) => lead.nextFollowUpAt).length;
  const topCategories = Object.entries(
    leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.niche] = (acc[lead.niche] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalLeads: leads.length,
    stageCounts,
    leadsByClient: await getClientSummaries(),
    leadsByCampaign: await getCampaignSummaries(),
    replyRate: leads.length ? Math.round((repliedish / leads.length) * 100) : 0,
    followUpRate: leads.length ? Math.round((followUpCount / leads.length) * 100) : 0,
    wonRate: leads.length ? Math.round((stageCounts.Won / leads.length) * 100) : 0,
    lostRate: leads.length ? Math.round((stageCounts.Lost / leads.length) * 100) : 0,
    topCategories,
    topScripts: [
      { title: "Auto Repair First Touch", usageCount: 18 },
      { title: "Real Estate Reactivation", usageCount: 11 },
      { title: "Auto Follow-Up After No Reply", usageCount: 9 }
    ],
    coachIdeas: [
      "Your highest-leverage move today is following up the qualified auto leads that already have WhatsApp.",
      "Reply rate is strongest on campaigns with clearer niche context. Tighten vague campaigns before adding more leads.",
      "The detailing offer converts when the message leads with visual proof, not vague marketing language."
    ]
  };
}

export async function buildAppSnapshot(): Promise<AppSnapshot> {
  return {
    clients: await getClients(),
    campaigns: await getCampaigns(),
    leads: await getLeads(),
    scripts: await getScripts(),
    forms: await getForms(),
    categories: await getCategories(),
    activityLogs: await getActivityLogs()
  };
}
