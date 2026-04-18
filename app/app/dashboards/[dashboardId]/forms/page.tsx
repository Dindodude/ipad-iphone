import { getCampaignById, getForms, getClientById } from "@/lib/data";

type FormsPageProps = {
  params: Promise<{ dashboardId: string }>;
};

export default async function DashboardFormsPage({ params }: FormsPageProps) {
  const { dashboardId } = await params;
  const campaign = await getCampaignById(dashboardId);
  const forms = (await getForms()).filter((form) => form.campaignId === dashboardId);
  const client = campaign ? await getClientById(campaign.clientId) : null;

  return (
    <div className="stack">
      <section className="page-title card">
        <div className="eyebrow">Campaign forms</div>
        <h1>{campaign?.name ?? "Campaign"} intake</h1>
        <p>Route inbound form traffic directly into this campaign so the leads land in the right client bucket from day one.</p>
      </section>
      {forms.map((form) => (
        <section key={form.id} className="card">
          <div className="section-head">
            <div>
              <div className="eyebrow">{client?.name ?? "Client"}</div>
              <h2>{form.name}</h2>
            </div>
            <span>{form.submissions} submissions</span>
          </div>
          <div className="code-line">{process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/forms/{campaign?.id}</div>
        </section>
      ))}
    </div>
  );
}
