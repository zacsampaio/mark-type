import { NextRequest, NextResponse } from "next/server";
import { buildStyledDocumentHtml } from "@doccraft/document-styles";
import HTMLtoDOCX from "html-to-docx";
import { markdownToHtml } from "@/lib/markdown";
import { createServerSupabaseClient } from "@/lib/supabase";
import { isValidTemplate } from "@/lib/templates";
import type { Template } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { markdown, template: rawTemplate } = (await req.json()) as {
      markdown: string;
      template: string;
    };

    if (!markdown) {
      return NextResponse.json({ error: "markdown is required" }, { status: 400 });
    }

    if (!rawTemplate || !isValidTemplate(rawTemplate)) {
      return NextResponse.json({ error: "template inválido" }, { status: 400 });
    }

    const template = rawTemplate as Template;
    const html = markdownToHtml(markdown);
    const fullHtml = buildStyledDocumentHtml(html, template);

    const docxBuffer = await HTMLtoDOCX(fullHtml, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
      title: "DocCraft",
      creator: "DocCraft",
      lang: "pt-BR",
    });

    const buffer = Buffer.isBuffer(docxBuffer)
      ? docxBuffer
      : Buffer.from(docxBuffer as ArrayBuffer);

    const supabase = createServerSupabaseClient();
    const filename = `docs/${Date.now()}-${template}.docx`;

    const { error: uploadError } = await supabase.storage
      .from("pdfs")
      .upload(filename, buffer, {
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: false,
      });

    if (uploadError) {
      console.error("[generate-docx] Supabase upload error:", uploadError.message);
      const base64 = buffer.toString("base64");
      return NextResponse.json({
        url: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`,
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from("pdfs")
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error("[generate-docx]", err);
    return NextResponse.json(
      { error: "Word export failed" },
      { status: 500 }
    );
  }
}
