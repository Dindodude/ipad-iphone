import { CRMWorkspace } from "@/components/crm-workspace";
import { getCampaignById, getCampaigns, getClients, getLeadsByCampaignId } from "@/lib/data";

type DashboardPageProps = {
  params: Promise<{ dashboardId: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { dashboardId } = await params;
  const [campaign, clients, campaigns, leads] = await Promise.all([
    getCampaignById(dashboardId),
    getClients(),
    getCampaigns(),
    getLeadsByCampaignId(dashboardId)
  ]);

  if (!campaign) {
    return (
      <section className="card empty-state">
        <h1>Campaign not found</h1>
        <p>This dashboard id no longer maps to a campaign.</p>
      </section>
    );
  }

  return (
    <CRMWorkspace
      clients={clients}
      campaigns={campaigns}
      leads={leads}
      initialCampaignId={campaign.id}
    />
  );
}
