import type { Campaign, Client, LeadWithRelations } from "@/lib/types";
import { PipelineWorkspace } from "@/components/pipeline-workspace";

export function CRMWorkspace({
  clients,
  campaigns,
  leads,
  initialCampaignId
}: {
  clients: Client[];
  campaigns: Campaign[];
  leads: LeadWithRelations[];
  initialCampaignId?: string;
}) {
  return (
    <PipelineWorkspace
      clients={clients}
      campaigns={campaigns}
      initialLeads={leads}
      initialCampaignId={initialCampaignId}
      title="Pipeline"
      description="Work every lead from one serious command surface."
    />
  );
}
