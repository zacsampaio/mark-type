import { createServerSupabaseClient } from "@/lib/supabase";
import type { Template } from "@/lib/types";

const EXPORT_BUCKET = "pdfs";

interface PersistExportInput {
  markdown: string;
  template: Template;
  fileUrl: string;
  title: string;
}

export async function uploadExportFile(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<{ publicUrl: string | null; errorMessage: string | null }> {
  const supabase = createServerSupabaseClient();
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
}: PersistExportInput): Promise<void> {
  const supabase = createServerSupabaseClient();
  await supabase.from("documents").insert({
    title,
    markdown,
    template,
    pdf_url: fileUrl,
    user_id: null,
  });
}

export function toDataUrl(contentType: string, buffer: Buffer): string {
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}
