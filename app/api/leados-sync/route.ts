import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getExpectedSessionToken } from "@/lib/auth";

type SyncPayload = {
  leads: unknown[];
  settings: unknown;
  updatedAt: string;
};

const globalStore = globalThis as typeof globalThis & {
  __leadosSyncStore?: Map<string, SyncPayload>;
};

function store() {
  if (!globalStore.__leadosSyncStore) {
    globalStore.__leadosSyncStore = new Map<string, SyncPayload>();
  }
  return globalStore.__leadosSyncStore;
}

async function authorized() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value === getExpectedSessionToken();
}

function makeCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  if (!(await authorized())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const code = String(body?.code || makeCode()).replace(/\D/g, "").slice(0, 6) || makeCode();
  const payload: SyncPayload = {
    leads: Array.isArray(body?.leads) ? body.leads : [],
    settings: body?.settings ?? null,
    updatedAt: new Date().toISOString()
  };

  store().set(code, payload);
  return NextResponse.json({ ok: true, code, updatedAt: payload.updatedAt });
}

export async function GET(request: Request) {
  if (!(await authorized())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const code = String(url.searchParams.get("code") || "").replace(/\D/g, "").slice(0, 6);
  const payload = store().get(code);

  if (!payload) {
    return NextResponse.json({ ok: false, error: "No sync data found for that code." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, code, ...payload });
}
