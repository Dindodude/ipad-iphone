import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getAuthCredentials, getExpectedSessionToken } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ClientBuilderWorkspaceRow = {
  owner_email: string;
  clients: unknown[];
  updated_at: string;
};

async function getOwnerEmail() {
  const cookieStore = await cookies();
  const authenticated = cookieStore.get(AUTH_COOKIE_NAME)?.value === getExpectedSessionToken();
  return authenticated ? getAuthCredentials().email.trim().toLowerCase() : null;
}

function unavailable() {
  return NextResponse.json({
    ok: false,
    configured: false,
    error: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  }, { status: 503 });
}

export async function GET() {
  const ownerEmail = await getOwnerEmail();

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return unavailable();

  const { data, error } = await supabase
    .from("zentrixa_client_builder_workspaces")
    .select("owner_email, clients, updated_at")
    .eq("owner_email", ownerEmail)
    .maybeSingle<ClientBuilderWorkspaceRow>();

  if (error) {
    return NextResponse.json({ ok: false, configured: true, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    configured: true,
    ownerEmail,
    clients: data?.clients ?? [],
    updatedAt: data?.updated_at ?? null
  });
}

export async function PUT(request: Request) {
  const ownerEmail = await getOwnerEmail();

  if (!ownerEmail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return unavailable();

  const body = await request.json().catch(() => null);
  const clients = Array.isArray(body?.clients) ? body.clients : [];
  const updatedAt = new Date().toISOString();

  const { error } = await supabase
    .from("zentrixa_client_builder_workspaces")
    .upsert({
      owner_email: ownerEmail,
      clients,
      updated_at: updatedAt
    }, { onConflict: "owner_email" });

  if (error) {
    return NextResponse.json({ ok: false, configured: true, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, configured: true, ownerEmail, updatedAt });
}
