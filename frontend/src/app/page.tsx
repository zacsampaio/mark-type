"use client";

import { useState, useCallback } from "react";
import { Header, type ExportKind } from "@/components/Header";
import { EditorPanel } from "@/components/EditorPanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { StatusBar } from "@/components/StatusBar";
import { SiteFooter } from "@/components/SiteFooter";
import { WorkspaceTabs, type WorkspaceMobileTab } from "@/components/WorkspaceTabs";
import { WorkspaceChrome } from "@/components/WorkspaceChrome";
import { cn } from "@/lib/utils";
import type { Template } from "@/lib/types";

const DEFAULT_MARKDOWN = `# DocCraft

> Transform your README into beautiful documentation.

## Features

- 📝 **Paste Markdown** or import directly from GitHub
- 🎨 **Multiple Templates** — Professional ABNT or Modern styles
- 📄 **Export PDF** with a single click
- ⚡ **Live Preview** as you type

## Installation

\`\`\`bash
npm install doccraft
cd my-project
npx doccraft init
\`\`\`

## Usage

\`\`\`typescript
import { DocCraft } from 'doccraft';

const doc = new DocCraft({
  template: 'professional',
  output: 'pdf',
});

await doc.generate('./README.md');
\`\`\`

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| template | string | \`modern\` | Document template |
| output | string | \`pdf\` | Output format |
| lang | string | \`en\` | Document language |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
`;

export default function Home() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [template, setTemplate] = useState<Template>("modern");
  const [exporting, setExporting] = useState<"idle" | ExportKind>("idle");
  const [exportStatus, setExportStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [lastExportKind, setLastExportKind] = useState<ExportKind | null>(null);
  const [mobileTab, setMobileTab] = useState<WorkspaceMobileTab>("edit");

  const handleExportPdf = useCallback(async () => {
    setExporting("pdf");
    setExportStatus("loading");
    setExportUrl(null);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, template }),
      });
      const data = await res.json();
      if (data.url) {
        setExportUrl(data.url);
        setLastExportKind("pdf");
        setExportStatus("success");
      } else {
        setExportStatus("error");
      }
    } catch {
      setExportStatus("error");
    } finally {
      setExporting("idle");
    }
  }, [markdown, template]);

  const handleExportDocx = useCallback(async () => {
    setExporting("docx");
    setExportStatus("loading");
    setExportUrl(null);
    try {
      const res = await fetch("/api/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, template }),
      });
      const data = await res.json();
      if (data.url) {
        setExportUrl(data.url);
        setLastExportKind("docx");
        setExportStatus("success");
      } else {
        setExportStatus("error");
      }
    } catch {
      setExportStatus("error");
    } finally {
      setExporting("idle");
    }
  }, [markdown, template]);

  return (
    <div className="doccraft-app flex min-h-dvh flex-col bg-parchment bg-paper-texture">
      <Header
        onExportPdf={handleExportPdf}
        onExportDocx={handleExportDocx}
        exporting={exporting}
        exportStatus={exportStatus}
        exportUrl={exportUrl}
        lastExportKind={lastExportKind}
      />

      <div className="flex min-h-0 flex-1 flex-col px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden rounded-2xl border border-ink-200/90 bg-white/95 shadow-[0_4px_6px_-1px_rgba(35,30,24,0.06),0_20px_40px_-12px_rgba(35,30,24,0.12)] backdrop-blur-sm">
          <WorkspaceTabs active={mobileTab} onChange={setMobileTab} />

          <WorkspaceChrome mobileTab={mobileTab} template={template} />

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <section
              className={cn(
                "flex min-h-[min(420px,55vh)] min-w-0 flex-1 flex-col border-ink-200/80 bg-parchment-50/90 lg:min-h-0",
                "border-b lg:border-b-0 lg:border-r",
                mobileTab !== "edit" && "hidden lg:flex"
              )}
              aria-label="Editor de Markdown"
            >
              <EditorPanel
                markdown={markdown}
                onMarkdownChange={setMarkdown}
              />
            </section>

            <section
              className={cn(
                "flex min-h-[min(420px,55vh)] min-w-0 flex-1 flex-col bg-white lg:min-h-0",
                mobileTab !== "preview" && "hidden lg:flex"
              )}
              aria-label="Pré-visualização"
            >
              <PreviewPanel
                markdown={markdown}
                template={template}
                onTemplateChange={setTemplate}
              />
            </section>
          </div>

          <StatusBar markdown={markdown} template={template} />
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
