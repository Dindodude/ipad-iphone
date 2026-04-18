export type ClientStatus = "active" | "inactive";

export type CampaignStatus = "active" | "paused" | "archived";

export type LeadStage =
  | "New"
  | "Contacted"
  | "Replied"
  | "Interested"
  | "Qualified"
  | "Won"
  | "Lost";

export type Priority = "high" | "medium" | "low";

export type WhatsAppStatus = "unknown" | "yes" | "no";

export type ScriptType =
  | "first-touch"
  | "follow-up"
  | "niche"
  | "objection"
  | "reactivation"
  | "ai-generated";

export type AiTask =
  | "first-message"
  | "follow-up"
  | "lead-summary"
  | "next-action"
  | "rank-leads"
  | "niche-offer"
  | "improve-outreach";

export type Client = {
  id: string;
  name: string;
  niche: string;
  contactPerson: string;
  phone: string;
  email: string;
  notes: string;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
};

export type Campaign = {
  id: string;
  clientId: string;
  name: string;
  source: string;
  description: string;
  nicheContext: string;
  defaultStage: LeadStage;
  defaultScriptId?: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
};

export type Lead = {
  id: string;
  clientId: string;
  campaignId: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  niche: string;
  source: string;
  whatsappStatus: WhatsAppStatus;
  leadStage: LeadStage;
  priority: Priority;
  tags: string[];
  notes: string;
  aiSummary: string;
  aiNextAction: string;
  score: number;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  createdAt: string;
  updatedAt: string;
  previousMessages: string[];
};

export type Script = {
  id: string;
  clientId?: string | null;
  campaignId?: string | null;
  title: string;
  type: ScriptType;
  content: string;
  category: string;
  niche?: string;
  createdAt: string;
  updatedAt: string;
};

export type FormField = {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea" | "select";
  required: boolean;
};

export type FormDefinition = {
  id: string;
  clientId: string;
  campaignId: string;
  name: string;
  fields: FormField[];
  defaultStage: LeadStage;
  active: boolean;
  submissions: number;
  conversionRate: number;
  createdAt: string;
  updatedAt: string;
};

export type ActivityLog = {
  id: string;
  leadId: string;
  type: "note" | "message" | "stage-change" | "ai" | "whatsapp" | "import";
  content: string;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  rules: string[];
};

export type LeadWithRelations = Lead & {
  client: Client;
  campaign: Campaign;
};

export type ClientSummary = {
  client: Client;
  campaignCount: number;
  leadCount: number;
  hotLeadCount: number;
  wonCount: number;
  repliedCount: number;
  whatsappReadyCount: number;
};

export type CampaignSummary = {
  campaign: Campaign;
  client: Client;
  leadCount: number;
  qualifiedCount: number;
  wonCount: number;
  followUpDueCount: number;
  replyRate: number;
};

export type DashboardOverview = {
  totalLeads: number;
  newLeads: number;
  leadsNeedingFollowUp: number;
  hotLeads: number;
  repliedLeads: number;
  closedLeads: number;
  whatsappReadyLeads: number;
  topPerformingClient: ClientSummary;
  topPerformingCampaign: CampaignSummary;
  recentActivity: Array<ActivityLog & { leadName: string }>;
  aiSuggestions: string[];
};

export type AnalyticsSummary = {
  totalLeads: number;
  stageCounts: Record<LeadStage, number>;
  leadsByClient: ClientSummary[];
  leadsByCampaign: CampaignSummary[];
  replyRate: number;
  followUpRate: number;
  wonRate: number;
  lostRate: number;
  topCategories: Array<{ category: string; count: number }>;
  topScripts: Array<{ title: string; usageCount: number }>;
  coachIdeas: string[];
};

export type AppSnapshot = {
  clients: Client[];
  campaigns: Campaign[];
  leads: Lead[];
  scripts: Script[];
  forms: FormDefinition[];
  categories: Category[];
  activityLogs: ActivityLog[];
};

export const LEAD_STAGE_ORDER: LeadStage[] = [
  "New",
  "Contacted",
  "Replied",
  "Interested",
  "Qualified",
  "Won",
  "Lost"
];
