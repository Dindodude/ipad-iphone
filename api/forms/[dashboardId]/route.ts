import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const leadPayloadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  city: z.string().optional().default(""),
  address: z.string().optional().default(""),
  niche: z.string().optional().default("Other"),
  notes: z.string().optional().default("")
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ dashboardId: string }> }
) {
  const { dashboardId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = leadPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid lead payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    dashboardId,
    message: "Lead payload accepted. Next step is inserting into the multi-client leads table for production.",
    lead: {
      ...parsed.data,
      source: "Instant Form",
      leadStage: "New",
      priority: "medium",
      whatsappStatus: "unknown"
    }
  });
}
