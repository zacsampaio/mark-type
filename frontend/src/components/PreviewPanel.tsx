"use client";

import { useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { customizationToCssVars } from "@marktype/document-styles";
import { markdownToHtml } from "@/lib/markdown";
import {
  PREVIEW_CONTENT_HEIGHT_MM,
  PREVIEW_CONTENT_WIDTH_MM,
  PREVIEW_PAGE,
} from "@/lib/preview-page-layout";
import type { DocumentCustomization } from "@/lib/document-customization";
import type { ExportFormat } from "@/lib/document-customization";
import type { Template } from "@/lib/types";
import { usePreviewPages } from "@/hooks/usePreviewPages";
import {
  ComplianceTemplate,
  DocumentTemplate,
  ManualTemplate,
  ModernTemplate,
  ProfessionalTemplate,
  SaasTemplate,
} from "@/components/preview-templates";
import { PreviewPageControls } from "@/components/PreviewPageControls";
import { PreviewScaledPage } from "@/components/PreviewScaledPage";
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
  previewPage: number;
  onPreviewPageChange: (page: number) => void;
  onPreviewPageCountChange: (count: number) => void;
}

function PreviewDocumentBody({
  template,
  html,
}: {
  template: Template;
  html: string;
}) {
  switch (template) {
    case "professional":
      return <ProfessionalTemplate html={html} />;
    case "modern":
      return <ModernTemplate html={html} />;
    case "saas":
      return <SaasTemplate html={html} />;
    case "document":
      return <DocumentTemplate html={html} />;
    case "manual":
      return <ManualTemplate html={html} />;
    case "compliance":
      return <ComplianceTemplate html={html} />;
    default:
      return <DocumentTemplate html={html} />;
  }
}

function PreviewDocumentRoot({
  style,
  children,
}: {
  style: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="preview-document-root doc-preview-customized" style={style}>
      {children}
    </div>
  );
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
  previewPage,
  onPreviewPageChange,
  onPreviewPageCountChange,
}: PreviewPanelProps) {
  const html = useMemo(() => markdownToHtml(markdown), [markdown]);

  const previewStyle = useMemo(
    () => customizationToCssVars(customization) as CSSProperties,
    [customization]
  );

  const { measureRef, pageCount, pageContentHeightPx, isPaginating } =
    usePreviewPages({
      html,
      template,
      previewStyle,
    });

  useEffect(() => {
    onPreviewPageCountChange(pageCount);
  }, [pageCount, onPreviewPageCountChange]);

  useEffect(() => {
    if (previewPage > pageCount) {
      onPreviewPageChange(pageCount);
    }
  }, [previewPage, pageCount, onPreviewPageChange]);

  useEffect(() => {
    onPreviewPageChange(1);
  }, [html, template, onPreviewPageChange]);

  const safePage = Math.min(Math.max(1, previewPage), pageCount);
  const pageOffsetPx = pageContentHeightPx * (safePage - 1);

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
                "Não é possível exportar o documento. Tente novamente."}
            </p>
          )}
        </div>
      )}

      {/* Medição invisível (largura/altura úteis do PDF) */}
      <div
        ref={measureRef}
        className="pointer-events-none fixed left-0 top-0 -z-50 opacity-0"
        aria-hidden
      >
        <div
          className="preview-page-measure-slot"
          style={{
            width: `${PREVIEW_CONTENT_WIDTH_MM}mm`,
            height: `${PREVIEW_CONTENT_HEIGHT_MM}mm`,
            position: "absolute",
            visibility: "hidden",
          }}
        />
        <div style={{ width: `${PREVIEW_CONTENT_WIDTH_MM}mm` }}>
          <PreviewDocumentRoot style={previewStyle}>
            <PreviewDocumentBody template={template} html={html} />
          </PreviewDocumentRoot>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-ink-100/40 px-2 py-3 sm:px-3 sm:py-4">
          <PreviewScaledPage
            className="preview-page-sheet"
            style={{
              boxSizing: "border-box",
              padding: `${PREVIEW_PAGE.marginTopMm}mm ${PREVIEW_PAGE.marginRightMm}mm ${PREVIEW_PAGE.marginBottomMm}mm ${PREVIEW_PAGE.marginLeftMm}mm`,
            }}
          >
            <div
              className="preview-page-body relative overflow-hidden"
              style={{ height: `${PREVIEW_CONTENT_HEIGHT_MM}mm` }}
            >
              {isPaginating && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-xs text-ink-500">
                  A calcular páginas…
                </div>
              )}
              <div
                className="will-change-transform"
                style={{
                  transform:
                    pageOffsetPx > 0
                      ? `translateY(-${pageOffsetPx}px)`
                      : undefined,
                }}
              >
                <PreviewDocumentRoot style={previewStyle}>
                  <PreviewDocumentBody template={template} html={html} />
                </PreviewDocumentRoot>
              </div>
            </div>
          </PreviewScaledPage>
        </div>

        <PreviewPageControls
          page={safePage}
          pageCount={pageCount}
          onPageChange={onPreviewPageChange}
        />
      </div>
    </div>
  );
}
