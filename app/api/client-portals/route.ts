import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getAuthCredentials, getExpectedSessionToken } from "@/lib/auth";
import { hashClientPassword } from "@/lib/client-portal-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function adminEmail() {
  const cookieStore = await cookies();
  const authenticated = cookieStore.get(AUTH_COOKIE_NAME)?.value === getExpectedSessionToken();
  return authenticated ? getAuthCredentials().email.trim().toLowerCase() : null;
}

function unavailable() {
  return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
}

export async function POST(request: Request) {
  const ownerEmail = await adminEmail();
  if (!ownerEmail) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  if (!supabase) return unavailable();

  const body = await request.json().catch(() => null);
  const portalId = String(body?.portalId || "");
  const loginIdentifier = String(body?.loginIdentifier || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const businessName = String(body?.businessName || "Client Portal").trim();
  const accessStatus = String(body?.accessStatus || "Active");
  const portalData = body?.portalData ?? {};

  if (!loginIdentifier) {
    return NextResponse.json({ ok: false, error: "Client login email/username is required." }, { status: 400 });
  }

  const updatePayload: Record<string, unknown> = {
    owner_email: ownerEmail,
    business_name: businessName,
    login_identifier: loginIdentifier,
    access_status: accessStatus,
    portal_data: portalData,
    updated_at: new Date().toISOString()
  };

  if (password) {
    const { hash, salt } = hashClientPassword(password);
    updatePayload.password_hash = hash;
    updatePayload.password_salt = salt;
  }

  if (portalId) {
    const { data: existing } = await supabase
      .from("zentrixa_client_portals")
      .select("password_hash, password_salt")
      .eq("id", portalId)
      .eq("owner_email", ownerEmail)
      .maybeSingle();

    if (!password) {
      updatePayload.password_hash = existing?.password_hash;
      updatePayload.password_salt = existing?.password_salt;
    }

    const { data, error } = await supabase
      .from("zentrixa_client_portals")
      .update(updatePayload)
      .eq("id", portalId)
      .eq("owner_email", ownerEmail)
      .select("id, login_identifier, access_status, updated_at")
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, portal: data });
  }

  if (!password) {
    return NextResponse.json({ ok: false, error: "Temporary password is required for new portals." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("zentrixa_client_portals")
    .insert(updatePayload)
    .select("id, login_identifier, access_status, updated_at")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, portal: data });
}
