"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { PENDING_IMPORT_STORAGE_KEY } from "@/lib/pending-import";
import { Header } from "@/components/Header";
import { EditorPanel } from "@/components/EditorPanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { StatusBar } from "@/components/StatusBar";
import { SiteFooter } from "@/components/SiteFooter";
import { WorkspaceTabs, type WorkspaceMobileTab } from "@/components/WorkspaceTabs";
import { WorkspaceChrome } from "@/components/WorkspaceChrome";
import { WorkspaceActionRow } from "@/components/WorkspaceActionRow";
import type { EditorTab } from "@/components/EditorTabBar";
import { cn } from "@/lib/utils";
import type { Template } from "@/lib/types";
import {
  DEFAULT_DOCUMENT_CUSTOMIZATION,
  type DocumentCustomization,
  type ExportFormat,
} from "@/lib/document-customization";

const DEFAULT_MARKDOWN = `# MarkType

> Transform your README into beautiful documentation.

## Features

- 📝 **Paste Markdown** or import directly from GitHub
- 🎨 **Multiple Templates** — Professional ABNT or Modern styles
- 📄 **Export PDF** with a single click
- ⚡ **Live Preview** as you type

## Installation

\`\`\`bash
npm install marktype
cd my-project
npx marktype init
\`\`\`

## Usage

\`\`\`typescript
import { MarkType } from 'marktype';

const doc = new MarkType({
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
  const pathname = usePathname();
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [importedRepoLabel, setImportedRepoLabel] = useState<string | null>(
    null
  );
  const [importToken, setImportToken] = useState(0);
  const [template, setTemplate] = useState<Template>("document");
  const [customization, setCustomization] = useState<DocumentCustomization>(
    DEFAULT_DOCUMENT_CUSTOMIZATION
  );
  const [lastExportFormat, setLastExportFormat] = useState<ExportFormat | null>(
    null
  );
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [exportErrorDetail, setExportErrorDetail] = useState<string | null>(
    null
  );
  const [mobileTab, setMobileTab] = useState<WorkspaceMobileTab>("edit");
  const [editorTab, setEditorTab] = useState<EditorTab>("paste");

  useEffect(() => {
    if (pathname !== "/") return;
    const raw = sessionStorage.getItem(PENDING_IMPORT_STORAGE_KEY);
    if (!raw) return;
    try {
      const p = JSON.parse(raw) as { markdown?: string; repoName?: string };
      if (typeof p.markdown === "string") {
        setMarkdown(p.markdown);
        setImportedRepoLabel(p.repoName ?? null);
        setImportToken((t) => t + 1);
      }
    } catch {
      /* ignore */
    } finally {
      sessionStorage.removeItem(PENDING_IMPORT_STORAGE_KEY);
    }
  }, [pathname]);

  const triggerDownload = useCallback(async (url: string, filename: string) => {
    if (url.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    try {
      const fileRes = await fetch(url, { mode: "cors" });
      if (!fileRes.ok) {
        throw new Error("fetch not ok");
      }
      const blob = await fileRes.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }, []);

  const handleExport = useCallback(async (format: ExportFormat) => {
    setLastExportFormat(format);
    setExporting(true);
    setExportStatus("loading");
    setExportErrorDetail(null);
    const endpoint =
      format === "pdf" ? "/api/generate-pdf" : "/api/generate-docx";
    const filename = format === "pdf" ? "documento.pdf" : "documento.docx";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, template, customization }),
      });
      let data: { url?: string; error?: string; note?: string } = {};
      try {
        data = await res.json();
      } catch {
        setExportErrorDetail("Resposta inválida do servidor.");
        setExportStatus("error");
        return;
      }
      if (!res.ok || typeof data.error === "string") {
        setExportErrorDetail(
          typeof data.error === "string"
            ? data.error
            : "Não foi possível concluir o pedido. Tente novamente."
        );
        setExportStatus("error");
        return;
      }
      if (data.url) {
        await triggerDownload(data.url, filename);
        setExportStatus("success");
        if (data.note) {
          console.info("[export]", data.note);
        }
      } else {
        setExportErrorDetail(
          format === "pdf"
            ? "O servidor não devolveu URL do PDF. Confira Supabase e variáveis de ambiente."
            : "O servidor não devolveu o ficheiro DOCX."
        );
        setExportStatus("error");
      }
    } catch {
      setExportErrorDetail("Erro de rede ou ao iniciar o download.");
      setExportStatus("error");
    } finally {
      setExporting(false);
    }
  }, [markdown, template, customization, triggerDownload]);

  return (
    <div className="marktype-app flex min-h-dvh flex-col bg-parchment bg-paper-texture">
      <Header />

      <div className="flex min-h-0 flex-1 flex-col px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden rounded-2xl border border-ink-200/90 bg-white/95 shadow-[0_4px_6px_-1px_rgba(35,30,24,0.06),0_20px_40px_-12px_rgba(35,30,24,0.12)] backdrop-blur-sm">
          <WorkspaceTabs active={mobileTab} onChange={setMobileTab} />

          <WorkspaceChrome mobileTab={mobileTab} template={template} />

          <WorkspaceActionRow
            editorTab={editorTab}
            onEditorTabChange={setEditorTab}
            template={template}
            onTemplateChange={setTemplate}
            customization={customization}
            onCustomizationChange={setCustomization}
            onExport={handleExport}
            exporting={exporting}
          />

          <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-2 lg:divide-x lg:divide-ink-200/80">
            <section
              className={cn(
                "flex min-h-[min(420px,55vh)] min-w-0 flex-1 flex-col bg-parchment-50/90 lg:min-h-0",
                "border-b border-ink-200/80 lg:border-b-0",
                mobileTab !== "edit" && "hidden lg:flex"
              )}
              aria-label="Editor de Markdown"
            >
              <EditorPanel
                markdown={markdown}
                onMarkdownChange={setMarkdown}
                activeTab={editorTab}
                onTabChange={setEditorTab}
                hideTabBarOnDesktop
                importedRepoName={importedRepoLabel}
                importToken={importToken}
                onImportedRepoConsumed={() => setImportedRepoLabel(null)}
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
                customization={customization}
                onCustomizationChange={setCustomization}
                onExport={handleExport}
                exporting={exporting}
                lastExportFormat={lastExportFormat}
                exportStatus={exportStatus}
                exportErrorDetail={exportErrorDetail}
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
