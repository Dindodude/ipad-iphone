import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CLIENT_PORTAL_COOKIE_NAME, readClientSessionToken } from "@/lib/client-portal-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ClientPortalView } from "@/components/client-portal-view";

export default async function ClientPortalPage({
  params
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const cookieStore = await cookies();
  const session = readClientSessionToken(cookieStore.get(CLIENT_PORTAL_COOKIE_NAME)?.value);

  if (!session || session.portalId !== clientId) {
    redirect("/client-login");
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return <main>Supabase is not configured.</main>;
  }

  const { data } = await supabase
    .from("zentrixa_client_portals")
    .select("id, business_name, portal_data, access_status")
    .eq("id", clientId)
    .eq("login_identifier", session.login)
    .eq("access_status", "Active")
    .maybeSingle();

  if (!data) {
    redirect("/client-login");
  }

  return <ClientPortalView portal={data} />;
}
