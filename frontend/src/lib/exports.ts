import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase";
import type { Template } from "@/lib/types";

export { toDataUrl } from "@/lib/export-download";

const EXPORT_BUCKET = "pdfs";

interface PersistExportInput {
  markdown: string;
  template: Template;
  fileUrl: string;
  title: string;
  /** NextAuth `session.user.id` (JWT sub): Supabase UUID ou id GitHub */
  sessionSub?: string | null;
}

/** `user_id` referencia auth.users: só UUID válido (login e-mail Supabase). GitHub usa só owner_sub. */
function columnsFromSessionSub(sub: string | null | undefined): {
  owner_sub: string | null;
  user_id: string | null;
} {
  if (!sub?.trim()) return { owner_sub: null, user_id: null };
  const s = sub.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s
  );
  return {
    owner_sub: s,
    user_id: isUuid ? s : null,
  };
}

export async function uploadExportFile(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<{ publicUrl: string | null; errorMessage: string | null }> {
  if (!isSupabaseConfigured()) {
    return {
      publicUrl: null,
      errorMessage: "Supabase não configurado (exportação local apenas).",
    };
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return { publicUrl: null, errorMessage: "Cliente Supabase indisponível." };
  }
  const { error: uploadError } = await supabase.storage
    .from(EXPORT_BUCKET)
    .upload(filename, buffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    return { publicUrl: null, errorMessage: uploadError.message };
  }

  const { data: publicUrlData } = supabase.storage
    .from(EXPORT_BUCKET)
    .getPublicUrl(filename);

  return { publicUrl: publicUrlData.publicUrl, errorMessage: null };
}

export async function persistExportRecord({
  markdown,
  template,
  fileUrl,
  title,
  sessionSub,
}: PersistExportInput): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { owner_sub, user_id } = columnsFromSessionSub(sessionSub);
  const supabase = createServerSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from("documents").insert({
    title,
    markdown,
    template,
    pdf_url: fileUrl,
    user_id,
    owner_sub,
  });
  if (error) {
    console.error("[documents] insert falhou (PDF já pode estar no Storage):", error.message);
  }
}
