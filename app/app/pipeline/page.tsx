"use client";

import { PipelineWorkspace } from "@/components/pipeline-workspace";
import { useAppState } from "@/components/app-state-provider";
import { getLeadsWithRelations } from "@/lib/snapshot-helpers";

export default function PipelinePage() {
  const { snapshot, updateLeads } = useAppState();
  const leadsWithRelations = getLeadsWithRelations(snapshot);

  return (
    <PipelineWorkspace
      clients={snapshot.clients}
      campaigns={snapshot.campaigns}
      initialLeads={leadsWithRelations}
      title="Pipeline"
      description="Move leads through a WhatsApp-first stage board with client and campaign filters, urgency visibility, and quick-action execution."
      onLeadsChange={(updater) =>
        updateLeads((current) =>
          updater(
            current.map((lead) => ({
              ...lead,
              client: snapshot.clients.find((client) => client.id === lead.clientId)!,
              campaign: snapshot.campaigns.find((campaign) => campaign.id === lead.campaignId)!
            }))
          ).map(({ client, campaign, ...lead }) => lead)
        )
      }
    />
  );
}
