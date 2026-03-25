import { NextRequest, NextResponse } from "next/server";
import { buildStyledDocumentHtml } from "@doccraft/document-styles";
import { markdownToHtml } from "@/lib/markdown";
import { createServerSupabaseClient } from "@/lib/supabase";
import { isValidTemplate } from "@/lib/templates";
import type { Template } from "@/lib/types";

const WORKER_URL = process.env.WORKER_URL ?? "http://localhost:4000";

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

    let pdfBuffer: Buffer | null = null;
    try {
      const workerRes = await fetch(`${WORKER_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, template, markdown }),
        signal: AbortSignal.timeout(30_000),
      });

      if (workerRes.ok) {
        const arrayBuffer = await workerRes.arrayBuffer();
        pdfBuffer = Buffer.from(arrayBuffer);
      } else {
        console.warn("[generate-pdf] Worker returned", workerRes.status);
      }
    } catch (workerErr) {
      console.warn("[generate-pdf] Worker unavailable, using fallback HTML", workerErr);
    }

    if (!pdfBuffer) {
      const fallbackHtml = buildStyledDocumentHtml(html, template);
      const base64 = Buffer.from(fallbackHtml).toString("base64");
      const dataUrl = `data:text/html;base64,${base64}`;

      return NextResponse.json({
        url: dataUrl,
        note: "PDF worker unavailable — returning styled HTML. Open in browser and use Print → Save as PDF.",
      });
    }

    const supabase = createServerSupabaseClient();
    const filename = `docs/${Date.now()}-${template}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("pdfs")
      .upload(filename, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("[generate-pdf] Supabase upload error:", uploadError.message);
      const base64 = pdfBuffer.toString("base64");
      return NextResponse.json({
        url: `data:application/pdf;base64,${base64}`,
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from("pdfs")
      .getPublicUrl(filename);

    await supabase.from("documents").insert({
      title: "Generated Document",
      markdown,
      template,
      pdf_url: publicUrlData.publicUrl,
      user_id: null,
    });

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err) {
    console.error("[generate-pdf]", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
