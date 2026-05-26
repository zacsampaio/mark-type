"use client";

import { useMemo, type CSSProperties } from "react";
import { customizationToCssVars } from "@marktype/document-styles";
import { markdownToHtml, parseMarkdown } from "@/lib/markdown";
import type { DocumentCustomization } from "@/lib/document-customization";
import type { ExportFormat } from "@/lib/document-customization";
import type { Template } from "@/lib/types";
import {
  ComplianceTemplate,
  DocumentTemplate,
  ManualTemplate,
  ModernTemplate,
  ProfessionalTemplate,
  SaasTemplate,
} from "@/components/preview-templates";
import { PreviewToolbar } from "@/components/PreviewToolbar";

interface PreviewPanelProps {
  markdown: string;
  template: Template;
  onTemplateChange: (t: Template) => void;
  customization: DocumentCustomization;
  onCustomizationChange: (c: DocumentCustomization) => void;
  onExport: (format: ExportFormat) => void;
  exporting: boolean;
  lastExportFormat?: ExportFormat | null;
  exportStatus: "idle" | "loading" | "success" | "error";
  exportErrorDetail?: string | null;
}

export function PreviewPanel({
  markdown,
  template,
  onTemplateChange,
  customization,
  onCustomizationChange,
  onExport,
  exporting,
  lastExportFormat,
  exportStatus,
  exportErrorDetail,
}: PreviewPanelProps) {
  const { html, parsed } = useMemo(() => {
    const parsed = parseMarkdown(markdown);
    const html = markdownToHtml(markdown);
    return { html, parsed };
  }, [markdown]);

  const previewStyle = useMemo(
    () => customizationToCssVars(customization) as CSSProperties,
    [customization]
  );

  const previewBody = (
    <>
      {template === "professional" && (
        <ProfessionalTemplate
          html={html}
          title={parsed.title}
          description={parsed.description}
        />
      )}
      {template === "modern" && (
        <ModernTemplate
          html={html}
          title={parsed.title}
          description={parsed.description}
        />
      )}
      {template === "saas" && (
        <SaasTemplate
          html={html}
          title={parsed.title}
          description={parsed.description}
        />
      )}
      {template === "document" && <DocumentTemplate html={html} />}
      {template === "manual" && <ManualTemplate html={html} />}
      {template === "compliance" && (
        <ComplianceTemplate
          html={html}
          title={parsed.title}
          description={parsed.description}
        />
      )}
    </>
  );

  const showExportFeedback =
    exportStatus === "success" || exportStatus === "error";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PreviewToolbar
        template={template}
        onTemplateChange={onTemplateChange}
        customization={customization}
        onCustomizationChange={onCustomizationChange}
        onExport={onExport}
        exporting={exporting}
        lastExportFormat={lastExportFormat}
        exportStatus={exportStatus}
        exportErrorDetail={exportErrorDetail}
      />

      {showExportFeedback && (
        <div className="hidden shrink-0 border-b border-ink-100 bg-white px-3 py-1.5 lg:block sm:px-4">
          {exportStatus === "success" && (
            <p className="text-xs font-medium text-jade" role="status">
              {lastExportFormat === "docx"
                ? "DOCX gerado — download iniciado."
                : "PDF gerado — download iniciado."}
            </p>
          )}
          {exportStatus === "error" && (
            <p className="text-xs text-red-700" role="alert">
              {exportErrorDetail?.trim() ||
                "Não foi possível exportar o documento. Tente novamente."}
            </p>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div
          className="doc-preview-customized mx-auto max-w-[720px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
          style={previewStyle}
        >
          {previewBody}
        </div>
      </div>
    </div>
  );
}
