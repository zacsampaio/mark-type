"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileDown, Loader2, Palette } from "lucide-react";
import type { DocumentCustomization } from "@/lib/document-customization";
import type { ExportFormat } from "@/lib/document-customization";
import type { Template } from "@/lib/types";
import { TEMPLATE_OPTIONS } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { DocumentCustomizationPanel } from "@/components/DocumentCustomizationPanel";

interface PreviewToolbarControlsProps {
  template: Template;
  onTemplateChange: (t: Template) => void;
  customization: DocumentCustomization;
  onCustomizationChange: (c: DocumentCustomization) => void;
  onExport: (format: ExportFormat) => void;
  exporting: boolean;
  className?: string;
  selectId?: string;
}

function ExportMenu({
  onExport,
  exporting,
}: {
  onExport: (format: ExportFormat) => void;
  exporting: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (format: ExportFormat) => {
    setOpen(false);
    onExport(format);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => !exporting && setOpen((o) => !o)}
        disabled={exporting}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors",
          "bg-ink-950 text-parchment border-ink-950 hover:bg-ink-900",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {exporting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <FileDown className="h-4 w-4" aria-hidden />
        )}
        Exportar
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-80 transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && !exporting && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1 min-w-[9rem] overflow-hidden rounded-lg border border-ink-200 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => pick("pdf")}
            className="flex w-full px-3 py-2 text-left text-sm font-medium text-ink-900 hover:bg-ink-50"
          >
            PDF
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => pick("docx")}
            className="flex w-full px-3 py-2 text-left text-sm font-medium text-ink-900 hover:bg-ink-50"
          >
            DOCX (Word)
          </button>
        </div>
      )}
    </div>
  );
}

/** Controles da barra (modelo, exportar, personalizar) — altura fixa h-11 */
export function PreviewToolbarControls({
  template,
  onTemplateChange,
  customization,
  onCustomizationChange,
  onExport,
  exporting,
  className,
  selectId = "preview-template-select",
}: PreviewToolbarControlsProps) {
  const [personalizationOpen, setPersonalizationOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2 bg-white px-1 sm:gap-3 sm:px-2",
        className
      )}
    >
      <label
        htmlFor={selectId}
        className="hidden shrink-0 text-sm font-medium text-ink-700 sm:inline"
      >
        Modelo do documento:
      </label>
      <label
        htmlFor={selectId}
        className="shrink-0 text-sm font-medium text-ink-700 sm:hidden"
      >
        Modelo:
      </label>
      <select
        id={selectId}
        value={template}
        onChange={(e) => onTemplateChange(e.target.value as Template)}
        className="h-9 min-w-0 max-w-[7.5rem] flex-1 rounded-lg border border-ink-200 bg-white pl-2 pr-7 text-sm font-medium text-ink-900 shadow-sm outline-none focus:border-ink-950 focus:ring-2 focus:ring-ink-950/10 sm:max-w-[9rem] sm:flex-none"
      >
        {TEMPLATE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <ExportMenu onExport={onExport} exporting={exporting} />

        <div className="relative">
          <button
            type="button"
            onClick={() => setPersonalizationOpen((o) => !o)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors",
              personalizationOpen
                ? "border-ink-950 bg-ink-50 text-ink-950"
                : "border-ink-200 bg-white text-ink-800 hover:bg-ink-50"
            )}
            aria-expanded={personalizationOpen}
            aria-haspopup="dialog"
          >
            <Palette className="h-4 w-4 shrink-0" aria-hidden />
            Personalizar
          </button>
          <DocumentCustomizationPanel
            open={personalizationOpen}
            onClose={() => setPersonalizationOpen(false)}
            value={customization}
            onChange={onCustomizationChange}
          />
        </div>
      </div>
    </div>
  );
}

interface PreviewToolbarProps {
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

/** Barra completa para mobile (controles + mensagens de exportação) */
export function PreviewToolbar({
  template,
  onTemplateChange,
  customization,
  onCustomizationChange,
  onExport,
  exporting,
  lastExportFormat,
  exportStatus,
  exportErrorDetail,
}: PreviewToolbarProps) {
  return (
    <div className="shrink-0 border-b border-ink-200/90 bg-white lg:hidden">
      <PreviewToolbarControls
        template={template}
        onTemplateChange={onTemplateChange}
        customization={customization}
        onCustomizationChange={onCustomizationChange}
        onExport={onExport}
        exporting={exporting}
        selectId="preview-template-select-mobile"
      />

      {(exportStatus === "success" || exportStatus === "error") && (
        <div className="border-t border-ink-100 px-3 py-1.5 sm:px-4">
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
    </div>
  );
}
