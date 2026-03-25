import express from "express";
import cors from "cors";
import { generatePdf } from "./pdf";

const app = express();
const PORT = parseInt(process.env.PORT ?? "4000", 10);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "marktype-worker", timestamp: new Date().toISOString() });
});

app.post("/generate", async (req, res) => {
  const { html, template, markdown } = req.body as {
    html: string;
    template: string;
    markdown?: string;
  };

  if (!html) {
    res.status(400).json({ error: "html is required" });
    return;
  }

  try {
    console.log(`[worker] Generating PDF — template: ${template}`);
    const pdfBuffer = await generatePdf(html, template, markdown);
    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", "inline; filename=document.pdf");
    res.send(pdfBuffer);
  } catch (err) {
    console.error("[worker] PDF generation failed:", err);
    res.status(500).json({ error: "PDF generation failed", detail: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`\n🔧 MarkType Worker running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Generate: POST http://localhost:${PORT}/generate\n`);
});
