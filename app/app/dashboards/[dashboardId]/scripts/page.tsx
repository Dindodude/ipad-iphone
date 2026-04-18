import { ScriptLibrary } from "@/components/script-library";
import { getCampaignById, getCampaigns, getClients, getScriptsForCampaign } from "@/lib/data";

type ScriptsPageProps = {
  params: Promise<{ dashboardId: string }>;
};

export default async function DashboardScriptsPage({ params }: ScriptsPageProps) {
  const { dashboardId } = await params;
  const [campaign, scripts, clients, campaigns] = await Promise.all([
    getCampaignById(dashboardId),
    getScriptsForCampaign(dashboardId),
    getClients(),
    getCampaigns()
  ]);

  return (
    <div className="stack">
      <section className="page-title card">
        <div className="eyebrow">Campaign scripts</div>
        <h1>{campaign?.name ?? "Campaign"} script stack</h1>
        <p>These are the scripts tied to this campaign, plus client-wide and global templates.</p>
      </section>
      <ScriptLibrary scripts={scripts} clients={clients} campaigns={campaigns} />
    </div>
  );
}
