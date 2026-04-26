"use client";

import { useParams } from "next/navigation";
import { ColdCallLeadOS } from "@/components/cold-call-leados";

export default function LeadDetailPage() {
  const params = useParams<{ leadId: string }>();
  return <ColdCallLeadOS view="detail" leadId={params.leadId} />;
}
