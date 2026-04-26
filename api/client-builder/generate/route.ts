import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, getExpectedSessionToken } from "@/lib/auth";

const schema = z.object({
  businessName: z.string().default(""),
  ownerName: z.string().default(""),
  industry: z.string().default(""),
  location: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().default(""),
  website: z.string().default(""),
  instagram: z.string().default(""),
  servicesOffered: z.string().default(""),
  targetCustomers: z.string().default(""),
  mainGoal: z.string().default(""),
  currentProblems: z.string().default(""),
  uniqueSellingPoints: z.string().default(""),
  competitors: z.string().default(""),
  packageSelected: z.string().default(""),
  projectType: z.string().default(""),
  brandColors: z.string().default(""),
  stylePreference: z.string().default(""),
  timeline: z.string().default(""),
  discoveryNotes: z.string().default("")
});

function fallback(input: z.infer<typeof schema>) {
  const business = input.businessName || "the client";
  const owner = input.ownerName || "there";
  const industry = input.industry || "local business";

  return {
    welcomeDocument: `# Welcome to Zentrixa, ${owner}\n\nWe will help ${business} build a professional growth system. Zentrixa will handle the website direction, content plan, lead capture, follow-up structure, and launch support.\n\nTimeline: ${input.timeline || "5-7 days"}.\n\nClient must provide logo, photos, service details, business hours, and approval feedback.\n\nNext step: confirm the plan and send assets.`,
    websitePlan: `# Website Plan\n\nHomepage: hero, services, proof, process, offer, lead form, footer.\n\nHeadline angle: ${business} helps ${input.targetCustomers || "local customers"} get better ${industry} services.\n\nCTA strategy: Call now and request a quote.\n\nDesign direction: ${input.stylePreference || "clean, premium, mobile-first"}.`,
    contentPlan: `# 30-Day Content Plan\n\nWeek 1: introduce ${business} and core services.\nWeek 2: show customer problems and quick tips.\nWeek 3: proof, process, and behind-the-scenes.\nWeek 4: direct offer, FAQs, and conversion posts.\n\nHooks: "Most people miss this...", "Before you book...", "Here is what to check first..."\n\nCTA: call, request quote, or message to get started.`,
    leadSystemPlan: `# Lead System Plan\n\nCapture leads through the website form, calls, social links, and ads if included.\n\nFollow up fast with a simple opener, log every lead, set reminders, and track source, status, next action, and close result.\n\nSuggested opener: "Thanks for reaching out to ${business}. What service are you looking for?"`
  };
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get(AUTH_COOKIE_NAME)?.value !== getExpectedSessionToken()) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const input = parsed.data;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: true, outputs: fallback(input), source: "fallback" });
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: `Generate a practical Zentrixa onboarding package as JSON with keys welcomeDocument, websitePlan, contentPlan, leadSystemPlan.

Client info:
${JSON.stringify(input, null, 2)}

Rules:
- Keep it professional and useful.
- Write in markdown.
- Focus on done-for-you website, content, ads, lead capture, and follow-up.
- No fluff.
- Return valid JSON only.`
    });

    const text = response.output_text || "";
    const outputs = JSON.parse(text);
    return NextResponse.json({ ok: true, outputs, source: "openai" });
  } catch {
    return NextResponse.json({ ok: true, outputs: fallback(input), source: "fallback" });
  }
}
