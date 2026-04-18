import type {
  ActivityLog,
  AnalyticsSummary,
  AppSnapshot,
  Campaign,
  CampaignSummary,
  Client,
  ClientSummary,
  DashboardOverview,
  Lead,
  LeadStage,
  LeadWithRelations
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
  if (lead.nextFollowUpAt && safeDateValue(lead.nextFollowUpAt) <= Date.now()) {
    score += 8;
  }
  return Math.min(score, 100);
}

export function getLeadWithRelations(snapshot: AppSnapshot, leadId: string): LeadWithRelations | null {
  const lead = snapshot.leads.find((item) => item.id === leadId);
  if (!lead) return null;
  const client = snapshot.clients.find((item) => item.id === lead.clientId);
  const campaign = snapshot.campaigns.find((item) => item.id === lead.campaignId);
  if (!client || !campaign) return null;
  return { ...lead, score: getLeadScore(lead), client, campaign };
}

export function getLeadsWithRelations(snapshot: AppSnapshot): LeadWithRelations[] {
  return snapshot.leads
    .map((lead) => getLeadWithRelations(snapshot, lead.id))
    .filter((lead): lead is LeadWithRelations => Boolean(lead));
}

export function getClientSummariesFromSnapshot(snapshot: AppSnapshot): ClientSummary[] {
  return snapshot.clients.map((client) => {
    const campaigns = snapshot.campaigns.filter((campaign) => campaign.clientId === client.id);
    const leads = snapshot.leads.filter((lead) => lead.clientId === client.id);
    return {
      client,
      campaignCount: campaigns.length,
      leadCount: leads.length,
      hotLeadCount: leads.filter((lead) => lead.priority === "high").length,
      wonCount: leads.filter((lead) => lead.leadStage === "Won").length,
      repliedCount: leads.filter((lead) => lead.leadStage === "Replied").length,
      whatsappReadyCount: leads.filter((lead) => lead.whatsappStatus === "yes").length
    };
  }).sort((a, b) => b.leadCount - a.leadCount);
}

export function getCampaignSummariesFromSnapshot(snapshot: AppSnapshot): CampaignSummary[] {
  return snapshot.campaigns.map((campaign) => {
    const client = snapshot.clients.find((item) => item.id === campaign.clientId) as Client;
    const leads = snapshot.leads.filter((lead) => lead.campaignId === campaign.id);
    const repliedCount = leads.filter((lead) =>
      lead.leadStage === "Replied" || lead.leadStage === "Interested" || lead.leadStage === "Qualified" || lead.leadStage === "Won"
    ).length;
    return {
      campaign,
      client,
      leadCount: leads.length,
      qualifiedCount: leads.filter((lead) => lead.leadStage === "Qualified").length,
      wonCount: leads.filter((lead) => lead.leadStage === "Won").length,
      followUpDueCount: leads.filter((lead) => lead.nextFollowUpAt && safeDateValue(lead.nextFollowUpAt) <= Date.now()).length,
      replyRate: leads.length ? Math.round((repliedCount / leads.length) * 100) : 0
    };
  }).sort((a, b) => b.leadCount - a.leadCount);
}

export function getDashboardOverviewFromSnapshot(snapshot: AppSnapshot): DashboardOverview {
  const leads = snapshot.leads.map((lead) => ({ ...lead, score: getLeadScore(lead) }));
  const clientSummaries = getClientSummariesFromSnapshot(snapshot);
  const campaignSummaries = getCampaignSummariesFromSnapshot(snapshot);
  const activities = [...snapshot.activityLogs].sort((a, b) => safeDateValue(b.createdAt) - safeDateValue(a.createdAt));

  return {
    totalLeads: leads.length,
    newLeads: leads.filter((lead) => lead.leadStage === "New").length,
    leadsNeedingFollowUp: leads.filter((lead) => lead.nextFollowUpAt && safeDateValue(lead.nextFollowUpAt) <= Date.now()).length,
    hotLeads: leads.filter((lead) => lead.priority === "high").length,
    repliedLeads: leads.filter((lead) => lead.leadStage === "Replied").length,
    closedLeads: leads.filter((lead) => lead.leadStage === "Won").length,
    whatsappReadyLeads: leads.filter((lead) => lead.whatsappStatus === "yes").length,
    topPerformingClient: clientSummaries[0] ?? {
      client: { id: "", name: "None", niche: "", contactPerson: "", phone: "", email: "", notes: "", status: "inactive", createdAt: "", updatedAt: "" },
      campaignCount: 0,
      leadCount: 0,
      hotLeadCount: 0,
      wonCount: 0,
      repliedCount: 0,
      whatsappReadyCount: 0
    },
    topPerformingCampaign: campaignSummaries[0] ?? {
      campaign: { id: "", clientId: "", name: "None", source: "", description: "", nicheContext: "", defaultStage: "New", status: "paused", createdAt: "", updatedAt: "" },
      client: { id: "", name: "None", niche: "", contactPerson: "", phone: "", email: "", notes: "", status: "inactive", createdAt: "", updatedAt: "" },
      leadCount: 0,
      qualifiedCount: 0,
      wonCount: 0,
      followUpDueCount: 0,
      replyRate: 0
    },
    recentActivity: activities.slice(0, 6).map((activity) => ({
      ...activity,
      leadName: snapshot.leads.find((lead) => lead.id === activity.leadId)?.name ?? "Unknown lead"
    })),
    aiSuggestions: [
      "Focus WhatsApp-first on qualified and replied leads with follow-up due in the next 24 hours.",
      "Use the current CSV import to rebuild categories before you start outreach again.",
      "Push the strongest campaign into AI-assisted follow-up mode first."
    ]
  };
}

export function getAnalyticsSummaryFromSnapshot(snapshot: AppSnapshot): AnalyticsSummary {
  const leads = snapshot.leads.map((lead) => ({ ...lead, score: getLeadScore(lead) }));
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

  return {
    totalLeads: leads.length,
    stageCounts,
    leadsByClient: getClientSummariesFromSnapshot(snapshot),
    leadsByCampaign: getCampaignSummariesFromSnapshot(snapshot),
    replyRate: leads.length ? Math.round((repliedish / leads.length) * 100) : 0,
    followUpRate: leads.length ? Math.round((leads.filter((lead) => lead.nextFollowUpAt).length / leads.length) * 100) : 0,
    wonRate: leads.length ? Math.round((stageCounts.Won / leads.length) * 100) : 0,
    lostRate: leads.length ? Math.round((stageCounts.Lost / leads.length) * 100) : 0,
    topCategories: Object.entries(
      leads.reduce<Record<string, number>>((acc, lead) => {
        acc[lead.niche] = (acc[lead.niche] ?? 0) + 1;
        return acc;
      }, {})
    ).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count),
    topScripts: snapshot.scripts.slice(0, 5).map((script, index) => ({
      title: script.title,
      usageCount: Math.max(1, snapshot.scripts.length - index)
    })),
    coachIdeas: [
      "Reply rate climbs when categories are cleaner and WhatsApp checks happen first.",
      "If the board is empty after reset, reimport the CSV before doing anything else.",
      "Use category-aware scripts instead of generic first messages."
    ]
  };
}

export function getActivityForLeadFromSnapshot(snapshot: AppSnapshot, leadId: string): ActivityLog[] {
  return [...snapshot.activityLogs]
    .filter((activity) => activity.leadId === leadId)
    .sort((a, b) => safeDateValue(b.createdAt) - safeDateValue(a.createdAt));
}
