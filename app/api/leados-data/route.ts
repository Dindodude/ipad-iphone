import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getAuthCredentials, getExpectedSessionToken } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type LeadOSWorkspaceRow = {
  owner_email: string;
  leads: unknown[];
  settings: unknown;
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
    .from("leados_workspaces")
    .select("owner_email, leads, settings, updated_at")
    .eq("owner_email", ownerEmail)
    .maybeSingle<LeadOSWorkspaceRow>();

  if (error) {
    return NextResponse.json({ ok: false, configured: true, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    configured: true,
    ownerEmail,
    leads: data?.leads ?? [],
    settings: data?.settings ?? null,
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
  const leads = Array.isArray(body?.leads) ? body.leads : [];
  const settings = body?.settings ?? null;
  const updatedAt = new Date().toISOString();

  const { error } = await supabase
    .from("leados_workspaces")
    .upsert({
      owner_email: ownerEmail,
      leads,
      settings,
      updated_at: updatedAt
    }, { onConflict: "owner_email" });

  if (error) {
    return NextResponse.json({ ok: false, configured: true, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, configured: true, ownerEmail, updatedAt });
}
