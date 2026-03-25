import { generateWithLatex } from "./latex";
import { generateWithPuppeteer } from "./renderer";

export async function generatePdf(
  html: string,
  template: string,
  markdown?: string
): Promise<Buffer> {
  // Try LaTeX first (higher quality)
  const latexEnabled = process.env.ENABLE_LATEX !== "false";

  if (latexEnabled) {
    try {
      console.log("[pdf] Attempting LaTeX generation...");
      const buffer = await generateWithLatex(html, template, markdown);
      console.log("[pdf] LaTeX succeeded");
      return buffer;
    } catch (latexErr) {
      console.warn("[pdf] LaTeX failed, falling back to Puppeteer:", latexErr);
    }
  }

  // Fallback: Puppeteer HTML → PDF
  console.log("[pdf] Using Puppeteer renderer...");
  return generateWithPuppeteer(html, template);
}
