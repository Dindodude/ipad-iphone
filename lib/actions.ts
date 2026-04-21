"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Campaign, Client, LeadStage } from "@/lib/types";

type ActionSuccess<T> = {
  ok: true;
  data: T;
  persisted: boolean;
};

type ActionFailure = {
  ok: false;
  error: string;
};

type ActionResult<T> = ActionSuccess<T> | ActionFailure;

type CreateClientInput = {
  name: string;
  niche: string;
  notes?: string;
};

type CreateCampaignInput = {
  name: string;
  source: string;
  clientId: string;
  description?: string;
};

type ClientRow = {
  id: string;
  name: string;
  niche: string;
  notes: string | null;
  status: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

type CampaignRow = {
  id: string;
  client_id: string;
  name: string;
  source: string;
  description: string | null;
  niche_context: string | null;
  default_stage: string | null;
  default_script_id: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};

function timestamp() {
  return new Date().toISOString();
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isMissingRelationError(message: string) {
  const lower = message.toLowerCase();
  return lower.includes("does not exist") || lower.includes("relation") || lower.includes("schema cache");
}

function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    niche: row.niche,
    contactPerson: row.contact_person ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    notes: row.notes ?? "",
    status: row.status === "inactive" ? "inactive" : "active",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    source: row.source,
    description: row.description ?? "",
    nicheContext: row.niche_context ?? "",
    defaultStage: (row.default_stage as LeadStage) ?? "New",
    defaultScriptId: row.default_script_id ?? undefined,
    status: row.status === "archived" || row.status === "paused" ? row.status : "active",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function buildClient(input: CreateClientInput): Client {
  const now = timestamp();
  return {
    id: crypto.randomUUID(),
    name: normalizeName(input.name),
    niche: normalizeName(input.niche),
    notes: (input.notes ?? "").trim(),
    contactPerson: "",
    phone: "",
    email: "",
    status: "active",
    createdAt: now,
    updatedAt: now
  };
}

function buildCampaign(input: CreateCampaignInput): Campaign {
  const now = timestamp();
  return {
    id: crypto.randomUUID(),
    clientId: input.clientId,
    name: normalizeName(input.name),
    source: input.source.trim(),
    description: (input.description ?? "").trim(),
    nicheContext: "",
    defaultStage: "New",
    status: "active",
    createdAt: now,
    updatedAt: now
  };
}

function validateClientInput(input: CreateClientInput) {
  if (!normalizeName(input.name)) {
    return "Client name is required.";
  }
  if (!normalizeName(input.niche)) {
    return "Niche or industry is required.";
  }
  return null;
}

function validateCampaignInput(input: CreateCampaignInput) {
  if (!normalizeName(input.name)) {
    return "Campaign name is required.";
  }
  if (!input.source.trim()) {
    return "Campaign source is required.";
  }
  if (!input.clientId.trim()) {
    return "Client is required.";
  }
  return null;
}

function revalidateLeadOSPaths() {
  revalidatePath("/app/clients");
  revalidatePath("/app/campaigns");
  revalidatePath("/app/pipeline");
}

export async function createClient(input: CreateClientInput): Promise<ActionResult<Client>> {
  const validationError = validateClientInput(input);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const fallbackClient = buildClient(input);
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { ok: true, data: fallbackClient, persisted: false };
  }

  const normalizedName = normalizeName(input.name);

  const existing = await supabase
    .from("clients")
    .select("id")
    .ilike("name", normalizedName)
    .limit(1)
    .maybeSingle();

  if (existing.error && !isMissingRelationError(existing.error.message)) {
    return { ok: false, error: existing.error.message };
  }

  if (existing.data?.id) {
    return { ok: false, error: "A client with that name already exists." };
  }

  const insert = await supabase
    .from("clients")
    .insert({
      name: normalizedName,
      niche: normalizeName(input.niche),
      notes: (input.notes ?? "").trim(),
      status: "active",
      contact_person: "",
      phone: "",
      email: ""
    })
    .select("*")
    .single();

  if (insert.error) {
    if (isMissingRelationError(insert.error.message)) {
      return { ok: true, data: fallbackClient, persisted: false };
    }
    return { ok: false, error: insert.error.message };
  }

  revalidateLeadOSPaths();
  return { ok: true, data: toClient(insert.data as ClientRow), persisted: true };
}

export async function deleteClient(clientId: string): Promise<ActionResult<{ id: string }>> {
  if (!clientId.trim()) {
    return { ok: false, error: "Client id is required." };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: true, data: { id: clientId }, persisted: false };
  }

  const leadDelete = await supabase.from("leads").delete().eq("client_id", clientId);
  if (leadDelete.error && !isMissingRelationError(leadDelete.error.message)) {
    return { ok: false, error: leadDelete.error.message };
  }

  const campaignDelete = await supabase.from("campaigns").delete().eq("client_id", clientId);
  if (campaignDelete.error && !isMissingRelationError(campaignDelete.error.message)) {
    return { ok: false, error: campaignDelete.error.message };
  }

  const clientDelete = await supabase.from("clients").delete().eq("id", clientId);
  if (clientDelete.error) {
    if (isMissingRelationError(clientDelete.error.message)) {
      return { ok: true, data: { id: clientId }, persisted: false };
    }
    return { ok: false, error: clientDelete.error.message };
  }

  revalidateLeadOSPaths();
  return { ok: true, data: { id: clientId }, persisted: true };
}

export async function createCampaign(input: CreateCampaignInput): Promise<ActionResult<Campaign>> {
  const validationError = validateCampaignInput(input);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const fallbackCampaign = buildCampaign(input);
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { ok: true, data: fallbackCampaign, persisted: false };
  }

  const normalizedName = normalizeName(input.name);
  const duplicate = await supabase
    .from("campaigns")
    .select("id")
    .eq("client_id", input.clientId)
    .ilike("name", normalizedName)
    .limit(1)
    .maybeSingle();

  if (duplicate.error && !isMissingRelationError(duplicate.error.message)) {
    return { ok: false, error: duplicate.error.message };
  }

  if (duplicate.data?.id) {
    return { ok: false, error: "That client already has a campaign with this name." };
  }

  const insert = await supabase
    .from("campaigns")
    .insert({
      client_id: input.clientId,
      name: normalizedName,
      source: input.source.trim(),
      description: (input.description ?? "").trim(),
      niche_context: "",
      default_stage: "New",
      status: "active"
    })
    .select("*")
    .single();

  if (insert.error) {
    if (isMissingRelationError(insert.error.message)) {
      return { ok: true, data: fallbackCampaign, persisted: false };
    }
    return { ok: false, error: insert.error.message };
  }

  revalidateLeadOSPaths();
  return { ok: true, data: toCampaign(insert.data as CampaignRow), persisted: true };
}

export async function deleteCampaign(campaignId: string): Promise<ActionResult<{ id: string }>> {
  if (!campaignId.trim()) {
    return { ok: false, error: "Campaign id is required." };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: true, data: { id: campaignId }, persisted: false };
  }

  const leadDelete = await supabase.from("leads").delete().eq("campaign_id", campaignId);
  if (leadDelete.error && !isMissingRelationError(leadDelete.error.message)) {
    return { ok: false, error: leadDelete.error.message };
  }

  const campaignDelete = await supabase.from("campaigns").delete().eq("id", campaignId);
  if (campaignDelete.error) {
    if (isMissingRelationError(campaignDelete.error.message)) {
      return { ok: true, data: { id: campaignId }, persisted: false };
    }
    return { ok: false, error: campaignDelete.error.message };
  }

  revalidateLeadOSPaths();
  return { ok: true, data: { id: campaignId }, persisted: true };
}
