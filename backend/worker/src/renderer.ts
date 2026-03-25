/**
 * Puppeteer-based PDF renderer (fallback when LaTeX is unavailable).
 * Requires puppeteer to be installed: npm install puppeteer
 */
import { buildStyledDocumentHtml } from "@doccraft/document-styles";

export async function generateWithPuppeteer(
  html: string,
  template: string
): Promise<Buffer> {
  let puppeteer: typeof import("puppeteer");
  try {
    puppeteer = await import("puppeteer");
  } catch {
    throw new Error(
      "Puppeteer not installed. Run: npm install puppeteer --workspace=@doccraft/worker"
    );
  }

  const styledHtml = buildStyledDocumentHtml(html, template);

  const browser = await puppeteer.default.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(styledHtml, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "2.5cm", right: "2.5cm", bottom: "2.5cm", left: "2.5cm" },
      printBackground: true,
      displayHeaderFooter: true,
      footerTemplate: `
        <div style="font-size:9px;color:#9e9280;width:100%;text-align:center;font-family:sans-serif;padding:0 2.5cm;">
          DocCraft · <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>`,
      headerTemplate: "<div></div>",
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
