import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (uses service role key for storage writes)
export function createServerSupabaseClient() {
  const hasServiceRole = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? supabaseAnonKey;
  if (!hasServiceRole && process.env.NODE_ENV === "development") {
    console.warn(
      "[supabase] SUPABASE_SERVICE_ROLE_KEY ausente — o upload para o bucket «pdfs» costuma falhar por RLS. Copia a service_role do dashboard ou de `supabase status`."
    );
  }
  return createClient(supabaseUrl, serviceKey);
}

// Database types
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
