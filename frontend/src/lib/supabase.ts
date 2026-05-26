import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
}

/** Cliente browser — só quando Supabase está configurado. */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(getSupabaseUrl(), getSupabaseAnonKey());
}

/** Cliente servidor (Storage / Postgres). */
export function createServerSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  const hasServiceRole = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? supabaseAnonKey;

  if (!hasServiceRole && process.env.NODE_ENV === "development") {
    console.warn(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY ausente — upload para o bucket «pdfs» pode falhar por RLS. Use `supabase status` ou o dashboard."
    );
  }

  return createClient(supabaseUrl, serviceKey);
}

export interface DocumentRecord {
  id: string;
  created_at: string;
  title: string;
  markdown: string;
  template: string;
  pdf_url: string | null;
  user_id: string | null;
  owner_sub: string | null;
}
