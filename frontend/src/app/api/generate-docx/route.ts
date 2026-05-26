import { NextRequest, NextResponse } from "next/server";
import {
  buildStyledDocumentHtml,
  mergeCustomization,
} from "@marktype/document-styles";
import { markdownToHtml } from "@/lib/markdown";
import { isValidTemplate } from "@/lib/templates";
import type { Template } from "@/lib/types";
import { toDataUrl } from "@/lib/export-download";
import type { DocumentCustomization } from "@/lib/document-customization";
import {
  DOCX_PAGE_MARGINS,
  prepareHtmlForDocx,
  wordFontFromStack,
} from "@/lib/prepare-docx-html";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_INLINE_DOCX_BYTES = 2_500_000;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      markdown?: string;
      template?: string;
      customization?: Partial<DocumentCustomization>;
    };

    const { markdown, template: rawTemplate, customization: customPartial } =
      body;

    if (!markdown) {
      return NextResponse.json({ error: "markdown is required" }, { status: 400 });
    }

    if (!rawTemplate || !isValidTemplate(rawTemplate)) {
      return NextResponse.json({ error: "template inválido" }, { status: 400 });
    }

    const template = rawTemplate as Template;
    const customization = mergeCustomization(customPartial);
    const html = markdownToHtml(markdown);
    const fullHtml = buildStyledDocumentHtml(html, template, {
      skipRemoteFonts: true,
      customization,
    });

    const docxBodyHtml = await prepareHtmlForDocx(
      fullHtml,
      customization,
      template
    );
    const wordFont = wordFontFromStack(customization.fontFamily);

    const HTMLtoDOCX = (await import("html-to-docx")).default;
    const rawBuffer = await HTMLtoDOCX(docxBodyHtml, null, {
      orientation: "portrait",
      margins: { ...DOCX_PAGE_MARGINS },
      font: wordFont,
      fontSize: 22,
      title: "Documento",
      decodeUnicode: true,
      table: {
        row: {
          cantSplit: true,
        },
      },
      footer: false,
      pageNumber: false,
    });

    const docxBuffer = Buffer.isBuffer(rawBuffer)
      ? rawBuffer
      : Buffer.from(rawBuffer as ArrayBuffer);

    if (docxBuffer.length > MAX_INLINE_DOCX_BYTES) {
      return NextResponse.json(
        {
          error:
            "O documento ficou grande demais para exportar. Tente um conteúdo mais curto.",
        },
        { status: 413 }
      );
    }

    return NextResponse.json({
      url: toDataUrl(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        docxBuffer
      ),
      note: "DOCX com estilos alinhados ao PDF (fontes e tabelas inline).",
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err ?? "unknown");
    console.error("[generate-docx]", err);
    return NextResponse.json(
      {
        error:
          "Não foi possível gerar o DOCX. Verifique o conteúdo e tente novamente.",
        ...(process.env.MARKTYPE_DEBUG_PDF === "1" ? { debug: raw } : {}),
      },
      { status: 500 }
    );
  }
}
