import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const requestSchema = z.object({
  task: z.enum([
    "first-message",
    "follow-up",
    "lead-summary",
    "next-action",
    "rank-leads",
    "niche-offer",
    "improve-outreach"
  ]),
  prompt: z.string().optional().default(""),
  clientName: z.string().optional().default(""),
  campaignName: z.string().optional().default(""),
  leadName: z.string().optional().default(""),
  businessName: z.string().optional().default(""),
  niche: z.string().optional().default(""),
  stage: z.string().optional().default(""),
  whatsappStatus: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  city: z.string().optional().default("")
});

function buildFallbackResponse(task: z.infer<typeof requestSchema>["task"], input: z.infer<typeof requestSchema>) {
  const business = input.businessName || input.leadName || "this lead";
  const niche = input.niche || "this niche";
  const city = input.city || "their area";

  switch (task) {
    case "first-message":
      return `Hey ${business}, quick one. I had an idea for how a ${niche.toLowerCase()} business in ${city} could turn more local attention into actual booked work. Want me to send it over?`;
    case "follow-up":
      return `Following up on ${business}: keep it short, reference the last touch, and make the next step easy. Best move is a soft bump with one useful angle and a simple yes/no CTA.`;
    case "lead-summary":
      return `${business} is currently in ${input.stage || "an active"} stage, sits in the ${niche} niche, and should be handled with a WhatsApp-first, low-friction outreach angle based on the notes you have saved.`;
    case "next-action":
      return `Next best action: if WhatsApp is still ${input.whatsappStatus || "unknown"}, check that first. If it is ready, send a direct message tied to the lead's current stage and make the CTA small and immediate.`;
    case "rank-leads":
      return `Rank hottest leads by this order: Qualified or Interested first, then replied leads with WhatsApp, then new leads with strong fit and a short follow-up window.`;
    case "niche-offer":
      return `Offer for ${niche}: combine one clear growth outcome, a short setup window, and a low-risk starter option so the lead can see value before committing long-term.`;
    case "improve-outreach":
      return `Tighten the outreach by removing vague marketing words, anchoring the message to one specific pain, and ending with a simple reply CTA that feels easy to answer on WhatsApp.`;
    default:
      return "No output available.";
  }
}

function buildInstruction(input: z.infer<typeof requestSchema>) {
  return `You are the AI copilot inside LeadOS, a WhatsApp-first lead command center for a marketing agency.

Task: ${input.task}
Prompt: ${input.prompt || "No custom prompt provided"}
Client: ${input.clientName || "Unknown"}
Campaign: ${input.campaignName || "Unknown"}
Lead: ${input.leadName || "Unknown"}
Business: ${input.businessName || "Unknown"}
Niche: ${input.niche || "Unknown"}
City: ${input.city || "Unknown"}
Lead Stage: ${input.stage || "Unknown"}
WhatsApp Status: ${input.whatsappStatus || "Unknown"}
Notes: ${input.notes || "None"}

Rules:
- Be concise, useful, and operator-focused
- Sound like a strong outreach/sales copilot
- Avoid fluff and generic startup phrasing
- Keep outreach usable in real WhatsApp messages
- If ranking or summarizing, keep it tight and actionable
- No emojis`;
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const input = parsed.data;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      text: buildFallbackResponse(input.task, input),
      source: "fallback"
    });
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: buildInstruction(input)
    });

    return NextResponse.json({
      ok: true,
      text: response.output_text || buildFallbackResponse(input.task, input),
      source: "openai"
    });
  } catch {
    return NextResponse.json({
      ok: true,
      text: buildFallbackResponse(input.task, input),
      source: "fallback"
    });
  }
}
