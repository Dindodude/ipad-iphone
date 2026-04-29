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

async function sendLeadEmail(submission: {
  name: string;
  phone: string;
  business: string;
  monthlyAdBudget: string;
  timeline: string;
  currentWebsite: string;
  help?: string;
  timestamp: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.CONTACT_EMAIL_FROM || user;
  const to = process.env.CONTACT_EMAIL_TO || "idreesrah0@gmail.com";

  if (!host || !user || !pass || !from) {
    return { sent: false, reason: "SMTP is not configured." };
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  await transporter.sendMail({
    from,
    to,
    subject: `New Zentrixa lead: ${submission.business}`,
    text: [
      "New Zentrixa landing page lead",
      "",
      `Name: ${submission.name}`,
      `Phone: ${submission.phone}`,
      `Business: ${submission.business}`,
      `Monthly ad budget: ${submission.monthlyAdBudget}`,
      `Timeline: ${submission.timeline}`,
      `Current website: ${submission.currentWebsite}`,
      submission.help ? `Need help with: ${submission.help}` : "",
      `Timestamp: ${submission.timestamp}`
    ].filter(Boolean).join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
        <h2>New Zentrixa landing page lead</h2>
        <p><strong>Name:</strong> ${submission.name}</p>
        <p><strong>Phone:</strong> ${submission.phone}</p>
        <p><strong>Business:</strong> ${submission.business}</p>
        <p><strong>Monthly ad budget:</strong> ${submission.monthlyAdBudget}</p>
        <p><strong>Timeline:</strong> ${submission.timeline}</p>
        <p><strong>Current website:</strong> ${submission.currentWebsite}</p>
        ${submission.help ? `<p><strong>Need help with:</strong> ${submission.help}</p>` : ""}
        <p><strong>Timestamp:</strong> ${submission.timestamp}</p>
      </div>
    `
  });

  return { sent: true };
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Please complete the required fields.";
    return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
  }

  const timestamp = new Date().toISOString();
  const lead = {
    name: parsed.data.name,
    phone: parsed.data.phone,
    business: parsed.data.business,
    monthlyAdBudget: parsed.data.monthlyAdBudget,
    timeline: parsed.data.timeline,
    currentWebsite: parsed.data.currentWebsite,
    help: parsed.data.help,
    timestamp
  };

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const result = await supabase.from("contact_submissions").insert({
      name: lead.name,
      email: "",
      phone: lead.phone,
      website: "",
      instagram: "",
      message: [
        `Business: ${lead.business}`,
        `Monthly ad budget: ${lead.monthlyAdBudget}`,
        `Timeline: ${lead.timeline}`,
        `Current website: ${lead.currentWebsite}`,
        lead.help ? `Need help with: ${lead.help}` : "",
        `Timestamp: ${lead.timestamp}`
      ].filter(Boolean).join("\n"),
      source: "zentrixa-public-site"
    });
    if (result.error && !result.error.message.toLowerCase().includes("does not exist")) {
      return NextResponse.json({ ok: false, error: "We couldn't save your message right now. Please call us directly." }, { status: 500 });
    }
  }

  try {
    await sendLeadEmail(lead);
  } catch (error) {
    console.error("[Zentrixa contact email failed]", error);
  }

  return NextResponse.json({
    ok: true,
    message: "We'll reach out shortly"
  });
}
