"use client";

import { useParams } from "next/navigation";
import { ClientBuilder } from "@/components/client-builder";

export default function ClientBuilderClientPage() {
  const params = useParams<{ id: string }>();
  return <ClientBuilder view="detail" clientId={params.id} />;
}
