import { NextResponse } from "next/server";

function describeEnv(value: string | undefined, options: { startsWith?: string; minLength?: number } = {}) {
  const trimmed = value?.trim() || "";
  return {
    present: trimmed.length > 0,
    length: trimmed.length,
    startsCorrectly: options.startsWith ? trimmed.startsWith(options.startsWith) : undefined,
    longEnough: options.minLength ? trimmed.length >= options.minLength : undefined
  };
}

export function GET() {
  return NextResponse.json({
    ok: true,
    environment: process.env.NODE_ENV || "unknown",
    supabase: {
      url: describeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, { startsWith: "https://" }),
      anonKey: describeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { minLength: 80 }),
      serviceRoleKey: describeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, { minLength: 80 })
    },
    auth: {
      adminEmail: describeEnv(process.env.ZENTRIXA_ADMIN_EMAIL),
      adminPassword: describeEnv(process.env.ZENTRIXA_ADMIN_PASSWORD),
      sessionSecret: describeEnv(process.env.ZENTRIXA_SESSION_SECRET, { minLength: 16 })
    }
  });
}
