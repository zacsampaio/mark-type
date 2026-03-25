import { NextRequest, NextResponse } from "next/server";
import { buildStyledDocumentHtml } from "@doccraft/document-styles";
import { markdownToHtml } from "@/lib/markdown";
import { isValidTemplate } from "@/lib/templates";
import type { Template } from "@/lib/types";
import { persistExportRecord, toDataUrl, uploadExportFile } from "@/lib/exports";

export const runtime = "nodejs";
export const maxDuration = 60;

async function renderPdfFromHtml(html: string): Promise<Buffer> {
  const isVercel = Boolean(process.env.VERCEL);
  if (isVercel) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteerCore = await import("puppeteer-core");
    const executablePath = await chromium.executablePath();
    const browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "24mm", right: "20mm", bottom: "24mm", left: "20mm" },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "24mm", right: "20mm", bottom: "24mm", left: "20mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

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
    const pdfBuffer = await renderPdfFromHtml(fullHtml);
    const filename = `docs/${Date.now()}-${template}.pdf`;
    const { publicUrl, errorMessage } = await uploadExportFile(
      filename,
      pdfBuffer,
      "application/pdf"
    );

    if (!publicUrl) {
      console.error("[generate-pdf] Supabase upload error:", errorMessage);
      return NextResponse.json({
        url: toDataUrl("application/pdf", pdfBuffer),
        note: "Upload no Supabase falhou; retornando arquivo direto em base64.",
      });
    }

    await persistExportRecord({
      markdown,
      template,
      fileUrl: publicUrl,
      title: "Generated PDF",
    });

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("[generate-pdf]", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
