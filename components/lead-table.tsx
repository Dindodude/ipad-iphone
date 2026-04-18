import Link from "next/link";
import type { LeadWithRelations } from "@/lib/types";

export function LeadTable({ leads }: { leads: LeadWithRelations[] }) {
  return (
    <div className="card table-wrap">
      <div className="section-head">
        <div>
          <div className="eyebrow">Lead table</div>
          <h2>High-speed lead list</h2>
        </div>
        <span>{leads.length} leads</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Lead</th>
            <th>Client</th>
            <th>Campaign</th>
            <th>Stage</th>
            <th>WhatsApp</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <Link href={`/app/leads/${lead.id}`}>{lead.name}</Link>
              </td>
              <td>{lead.client.name}</td>
              <td>{lead.campaign.name}</td>
              <td>{lead.leadStage}</td>
              <td>{lead.whatsappStatus}</td>
              <td>{lead.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
