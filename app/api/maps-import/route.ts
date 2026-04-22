import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  url: z.string().trim().url("Please paste a valid Google Maps link.")
});

const GOOGLE_HOST_PATTERN = /(^|\.)google\.[a-z.]+$/i;
const GOOGLE_MAPS_PATH_PATTERN = /\/maps(\/|$)/i;
const WEBSITE_BLOCKLIST = [
  "google.com",
  "google.ca",
  "maps.google.com",
  "maps.gstatic.com",
  "www.gstatic.com",
  "fonts.gstatic.com",
  "streetviewpixels-pa.googleapis.com",
  "lh3.ggpht.com",
  "lh4.ggpht.com",
  "lh5.ggpht.com",
  "lh6.ggpht.com",
  "accounts.google.com",
  "business.google.com",
  "support.google.com",
  "docs.google.com",
  "apis.google.com",
  "ogads-pa.clients6.google.com",
  "csi.gstatic.com"
];

function decodeEscapes(input: string) {
  return input
    .replace(/\\u([\dA-Fa-f]{4})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeWhitespace(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function cleanPhone(value: string) {
  return normalizeWhitespace(value.replace(/[^\d+()\-.\s]/g, ""));
}

function isAllowedWebsite(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (WEBSITE_BLOCKLIST.includes(host)) return false;
    if (host.endsWith(".google.com") || host.endsWith(".google.ca")) return false;
    if (host.endsWith(".gstatic.com")) return false;
    if (host.endsWith(".googleapis.com")) return false;
    if (host.endsWith(".ggpht.com")) return false;
    if (host.includes("googleusercontent")) return false;
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(parsed.pathname)) return false;
    return true;
  } catch {
    return false;
  }
}

function pickCompanyName(decodedHtml: string) {
  const patterns = [
    /\)\]\}'\s*\n\[\[null,"([^"]+)"/,
    /\[\[null,"([^"]+)",\[\[/,
    /"([^"]+?),\s*[^"]+?"\s*,\s*\[\[\d+\.\d+,/
  ];

  for (const pattern of patterns) {
    const match = decodedHtml.match(pattern);
    const raw = match?.[1];
    if (!raw) continue;
    const normalized = normalizeWhitespace(raw);
    if (!normalized || normalized.toLowerCase() === "google maps") continue;
    return normalized.split(",")[0]?.trim() || normalized;
  }

  return "";
}

function pickPhone(decodedHtml: string) {
  const patterns = [
    /\+\d[\d\s().-]{8,}\d/g,
    /\(\d{3}\)\s*\d{3}[-.\s]\d{4}/g,
    /\d{3}[-.\s]\d{3}[-.\s]\d{4}/g
  ];

  for (const pattern of patterns) {
    const matches = decodedHtml.match(pattern);
    const phone = matches?.map(cleanPhone).find((value) => value.length >= 10);
    if (phone) return phone;
  }

  return "";
}

function pickWebsite(decodedHtml: string) {
  const matches = decodedHtml.match(/https?:\/\/[^\s"'<>\\]+/g) ?? [];
  const candidates = unique(
    matches
      .map((item) => item.replace(/[),.;]+$/, ""))
      .filter(isAllowedWebsite)
  );

  return candidates[0] ?? "";
}

function pickIndustry(decodedHtml: string) {
  const patterns = [
    /"([A-Za-z][A-Za-z &/'-]{2,60})","Phone"/,
    /"([A-Za-z][A-Za-z &/'-]{2,60})","Address"/,
    /,"([A-Za-z][A-Za-z &/'-]{2,60})","Website"/
  ];

  for (const pattern of patterns) {
    const match = decodedHtml.match(pattern);
    const value = match?.[1] ? normalizeWhitespace(match[1]) : "";
    if (!value) continue;
    if (value.toLowerCase() === "google maps") continue;
    return value;
  }

  return "";
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Please paste a valid Google Maps link.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const inputUrl = parsed.data.url;
  let validatedUrl: URL;

  try {
    validatedUrl = new URL(inputUrl);
  } catch {
    return NextResponse.json({ ok: false, error: "Please paste a valid Google Maps link." }, { status: 400 });
  }

  const host = validatedUrl.hostname.toLowerCase();
  if (!GOOGLE_HOST_PATTERN.test(host) || !GOOGLE_MAPS_PATH_PATTERN.test(validatedUrl.pathname)) {
    return NextResponse.json(
      { ok: false, error: "Use a Google Maps business link so we can try to pull the business details." },
      { status: 400 }
    );
  }

  let html = "";
  let finalUrl = inputUrl;

  try {
    const response = await fetch(inputUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        "accept-language": "en-CA,en;q=0.9"
      },
      redirect: "follow",
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: "Google Maps blocked the import for that link. Try a direct business share link." },
        { status: 502 }
      );
    }

    finalUrl = response.url || inputUrl;
    html = await response.text();
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn't reach that Google Maps link right now. Try again in a moment." },
      { status: 502 }
    );
  }

  const decodedHtml = decodeEscapes(html);
  const companyName = pickCompanyName(decodedHtml);
  const phoneNumber = pickPhone(decodedHtml);
  const website = pickWebsite(decodedHtml);
  const industry = pickIndustry(decodedHtml);

  const fields = {
    companyName,
    contactName: "",
    phoneNumber,
    website,
    industry
  };

  const foundEntries = Object.entries(fields).filter(([, value]) => value);
  if (foundEntries.length === 0) {
    return NextResponse.json({
      ok: false,
      error: "We couldn't pull usable business details from that link. Try a direct place share link from Google Maps."
    });
  }

  const missing = Object.entries(fields)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return NextResponse.json({
    ok: true,
    fields,
    sourceUrl: finalUrl,
    imported: foundEntries.map(([key]) => key),
    missing,
    message:
      missing.length > 0
        ? `Imported ${foundEntries.map(([key]) => key).join(", ")}. Some fields still need to be filled manually.`
        : "Imported business details from Google Maps."
  });
}
