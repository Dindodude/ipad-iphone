import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  phone: z.string().trim().min(1, "Phone number is required."),
  business: z.string().trim().min(1, "Tell us what your business is."),
  monthlyAdBudget: z.string().trim().min(1, "Select your monthly ad budget."),
  timeline: z.string().trim().min(1, "Select when you want to start."),
  currentWebsite: z.string().trim().min(1, "Tell us if you have a website."),
  help: z.string().trim().optional()
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Please complete the required fields.";
    return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const submission = {
    name: parsed.data.name,
    email: "",
    phone: parsed.data.phone,
    website: "",
    instagram: "",
    message: [
      `Business: ${parsed.data.business}`,
      `Monthly ad budget: ${parsed.data.monthlyAdBudget}`,
      `Timeline: ${parsed.data.timeline}`,
      `Current website: ${parsed.data.currentWebsite}`,
      parsed.data.help ? `Need help with: ${parsed.data.help}` : ""
    ]
      .filter(Boolean)
      .join("\n"),
    source: "zentrixa-public-site"
  };

  if (supabase) {
    const result = await supabase.from("contact_submissions").insert(submission);
    if (result.error && !result.error.message.toLowerCase().includes("does not exist")) {
      return NextResponse.json({ ok: false, error: "We couldn't save your message right now. Please call us directly." }, { status: 500 });
    }
  } else {
    console.log("[Zentrixa contact submission]", submission);
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks, you're in. We’ll reach out shortly to help you get more customers."
  });
}
