import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import juice from "juice";
import * as cheerio from "cheerio";
import type { DocumentCustomization } from "@/lib/document-customization";
import type { Template } from "@/lib/types";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export { DOCX_PAGE_MARGINS } from "@/lib/preview-page-layout";

const MAX_IMAGE_BYTES = 1_500_000;

function resolvePublicFile(urlPath: string): string | null {
  const rel = urlPath.replace(/^\//, "").split("?")[0];
  const candidates = [
    path.join(process.cwd(), "frontend", "public", rel),
    path.join(process.cwd(), "public", rel),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function stripControlChars(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function cleanStyle(style: string): string {
  return style
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const key = part.split(":")[0]?.trim().toLowerCase();
      if (!key) return false;
      if (key === "display" || key === "box-sizing") return false;
      if (key === "max-width" || key === "max-height") return false;
      if (part.includes("undefined")) return false;
      return true;
    })
    .join(";");
}

async function embedImagesAsDataUrls(html: string): Promise<string> {
  const imgRe = /<img\b([^>]*?)\ssrc=["']([^"']+)["']([^>]*)>/gi;
  const parts: string[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = imgRe.exec(html)) !== null) {
    parts.push(html.slice(last, match.index));
    const before = match[1];
    const src = match[2];
    const after = match[3];
    const altMatch = /alt=["']([^"']*)["']/i.exec(match[0]);
    const alt = altMatch?.[1] ?? "Imagem";

    let replacement: string;

    if (src.startsWith("data:")) {
      replacement = `<img${before} src="${src}"${after}>`;
    } else if (src.startsWith("/") && !src.startsWith("//")) {
      const filePath = resolvePublicFile(src);
      if (filePath) {
        try {
          const buf = await fs.readFile(filePath);
          if (buf.length > MAX_IMAGE_BYTES) {
            replacement = `<p><em>[${alt} — imagem omitida no DOCX por tamanho]</em></p>`;
          } else {
            const ext = path.extname(filePath).toLowerCase();
            const mime = MIME[ext] ?? "application/octet-stream";
            const dataSrc = `data:${mime};base64,${buf.toString("base64")}`;
            replacement = `<img${before} src="${dataSrc}" alt="${alt}"${after}>`;
          }
        } catch {
          replacement = `<p><em>[${alt}]</em></p>`;
        }
      } else {
        replacement = `<p><em>[${alt} — ficheiro não encontrado]</em></p>`;
      }
    } else {
      replacement = `<p><em>[${alt}]</em></p>`;
    }

    parts.push(replacement);
    last = match.index + match[0].length;
  }

  parts.push(html.slice(last));
  return parts.join("");
}

/** Nome de fonte reconhecido pelo Word a partir do stack CSS. */
export function wordFontFromStack(fontFamily: string): string {
  const f = fontFamily.toLowerCase();
  if (f.includes("georgia") || f.includes("times")) return "Georgia";
  if (f.includes("playfair")) return "Georgia";
  if (f.includes("jakarta") || f.includes("dm sans") || f.includes("sans"))
    return "Calibri";
  if (f.includes("mono") || f.includes("jetbrains")) return "Consolas";
  return "Times New Roman";
}

function sanitizeForWord($: cheerio.CheerioAPI): void {
  $("hr").each((_, el) => {
    $(el).replaceWith(
      '<p style="border-top:1px solid #cccccc;margin:12pt 0;padding:0;line-height:1pt;font-size:1pt;">&nbsp;</p>'
    );
  });

  $("a").each((_, el) => {
    $(el).removeAttr("target").removeAttr("rel");
  });

  $("*").each((_, el) => {
    const style = $(el).attr("style");
    if (style) {
      const cleaned = cleanStyle(style);
      if (cleaned) $(el).attr("style", cleaned);
      else $(el).removeAttr("style");
    }
  });

  $("body, div, p, li, td, th, h1, h2, h3, h4, blockquote, span").each(
    (_, el) => {
      const el_ = $(el);
      el_.contents().each((__, node) => {
        if (node.type === "text" && node.data) {
          node.data = stripControlChars(node.data);
        }
      });
    }
  );
}

function strengthenWordMarkup(
  bodyHtml: string,
  customization: DocumentCustomization,
  template: Template
): string {
  const isManual = template === "manual";
  const $ = cheerio.load(`<div id="docx-root">${bodyHtml}</div>`, {
    xmlMode: false,
  });

  const bodyStyle = cleanStyle(
    `font-family:${customization.fontFamily};color:${customization.bodyColor};font-size:11pt;line-height:1.5;`
  );

  $("#docx-root").attr("style", bodyStyle);

  $("#docx-root h1").each((_, el) => {
    $(el).attr(
      "style",
      cleanStyle(
        "font-size:17pt;font-weight:bold;margin:0 0 8pt 0;text-align:center;"
      )
    );
  });

  $("#docx-root h2").each((_, el) => {
    $(el).attr(
      "style",
      cleanStyle("font-size:13pt;font-weight:bold;margin:14pt 0 6pt 0;")
    );
  });

  $("#docx-root h3").each((_, el) => {
    $(el).attr(
      "style",
      cleanStyle(
        "font-size:11pt;font-weight:bold;font-style:italic;margin:10pt 0 4pt 0;"
      )
    );
  });

  $("#docx-root p").each((_, el) => {
    const cur = cleanStyle($(el).attr("style") ?? "");
    $(el).attr(
      "style",
      cleanStyle(`${cur};margin:0 0 6pt 0;text-align:justify;`)
    );
  });

  $("#docx-root table").each((_, table) => {
    const tableStyle = isManual
      ? "width:auto;border-collapse:collapse;margin:0 auto 10pt auto;"
      : "width:100%;border-collapse:collapse;margin:0 0 10pt 0;";
    $(table).attr("style", tableStyle);
    const cellAlign = isManual ? "center" : "left";
    $(table)
      .find("th")
      .attr(
        "style",
        cleanStyle(
          `background-color:${customization.tableHeaderBackground};color:${customization.tableHeaderColor};padding:6pt 8pt;font-weight:bold;font-size:10pt;border:1px solid ${customization.tableBorderColor};text-align:${cellAlign};vertical-align:middle;`
        )
      );
    $(table)
      .find("td")
      .attr(
        "style",
        cleanStyle(
          `padding:5pt 8pt;font-size:10pt;border:1px solid ${customization.tableBorderColor};text-align:${cellAlign};vertical-align:middle;`
        )
      );
    $(table)
      .find("tbody tr")
      .each((rowIndex, tr) => {
        if (rowIndex % 2 === 1) {
          $(tr)
            .find("td")
            .each((_, td) => {
              const cur = cleanStyle($(td).attr("style") ?? "");
              $(td).attr(
                "style",
                cleanStyle(
                  `${cur};background-color:${customization.tableRowAltBackground};`
                )
              );
            });
        }
      });
  });

  $("#docx-root img").each((_, el) => {
    $(el).attr(
      "style",
      cleanStyle("width:400px;height:auto;margin:8pt auto;")
    );
  });

  $("#docx-root em").each((_, el) => {
    const inner = $(el).html() ?? "";
    $(el).replaceWith(`<span style="font-style:italic;">${inner}</span>`);
  });

  $("#docx-root strong").each((_, el) => {
    const inner = $(el).html() ?? "";
    $(el).replaceWith(`<span style="font-weight:bold;">${inner}</span>`);
  });

  sanitizeForWord($);
  normalizeInlineParagraphs($);

  return $("#docx-root").html() ?? bodyHtml;
}

/** Garante que texto solto com strong/em fique dentro de <p> (corrige HTML legado). */
function normalizeInlineParagraphs($: cheerio.CheerioAPI): void {
  $("#docx-root")
    .children()
    .each((_, el) => {
      const tag = (el as { tagName?: string }).tagName?.toLowerCase();
      if (!tag || tag === "p" || tag === "div") return;
      if (/^h[1-6]$/.test(tag) || tag === "table" || tag === "ul" || tag === "ol")
        return;
      if (tag === "blockquote" || tag === "pre" || tag === "hr") return;

      const html = $.html(el);
      $(el).replaceWith(`<p style="margin:0 0 6pt 0;text-align:justify;">${html}</p>`);
    });
}

/**
 * Converte HTML estilizado (como no PDF) em fragmento inline para html-to-docx.
 */
export async function prepareHtmlForDocx(
  fullHtml: string,
  customization: DocumentCustomization,
  template: Template
): Promise<string> {
  const inlined = juice(fullHtml, {
    removeStyleTags: true,
    preserveImportant: true,
    applyWidthAttributes: false,
    applyAttributesTableElements: false,
  });

  const bodyMatch = inlined.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let body = bodyMatch?.[1]?.trim() ?? inlined;

  body = await embedImagesAsDataUrls(body);
  body = strengthenWordMarkup(body, customization, template);

  return body;
}
