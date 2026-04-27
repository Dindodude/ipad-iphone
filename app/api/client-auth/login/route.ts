import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE_NAME, makeClientSessionToken, verifyClientPassword } from "@/lib/client-portal-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PortalRow = {
  id: string;
  login_identifier: string;
  password_hash: string;
  password_salt: string;
  access_status: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const login = String(body?.login || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!login || !password) {
    return NextResponse.json({ ok: false, error: "Login and password are required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("zentrixa_client_portals")
    .select("id, login_identifier, password_hash, password_salt, access_status")
    .eq("login_identifier", login)
    .maybeSingle<PortalRow>();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "Invalid login." }, { status: 401 });
  }

  if (data.access_status !== "Active") {
    return NextResponse.json({ ok: false, error: "Portal access is disabled." }, { status: 403 });
  }

  if (!verifyClientPassword(password, data.password_salt, data.password_hash)) {
    return NextResponse.json({ ok: false, error: "Invalid login." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(CLIENT_PORTAL_COOKIE_NAME, makeClientSessionToken(data.id, data.login_identifier), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });

  return NextResponse.json({ ok: true, portalId: data.id });
}
