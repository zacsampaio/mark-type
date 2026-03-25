"use client";

import {
  FileDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  FileType2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ExportKind = "pdf" | "docx";

interface HeaderProps {
  onExportPdf: () => void;
  onExportDocx: () => void;
  exporting: "idle" | ExportKind;
  exportStatus: "idle" | "loading" | "success" | "error";
  exportUrl: string | null;
  lastExportKind: ExportKind | null;
}

export function Header({
  onExportPdf,
  onExportDocx,
  exporting,
  exportStatus,
  exportUrl,
  lastExportKind,
}: HeaderProps) {
  const busyPdf = exporting === "pdf";
  const busyDocx = exporting === "docx";
  const busy = busyPdf || busyDocx;

  const successLabel =
    lastExportKind === "docx" ? "Word pronto — baixar" : "PDF pronto — baixar";

  const defaultFilename =
    lastExportKind === "docx" ? "documento.docx" : "documento.pdf";

  return (
    <header className="shrink-0 border-b border-ink-200/90 bg-parchment-50/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950 shadow-md ring-1 ring-ink-950/20">
            <BookOpen className="h-5 w-5 text-parchment" aria-hidden />
          </div>
          <div>
            <span className="font-display text-xl font-bold leading-tight text-ink-950">
              DocCraft
            </span>
            <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink-400">
              Gerador de documentação
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {exportStatus === "success" && exportUrl && (
            <a
              href={exportUrl}
              download={defaultFilename}
              className="animate-fade-up inline-flex items-center justify-center gap-2 rounded-lg border border-jade/30 bg-jade/5 px-3 py-2 text-sm font-medium text-jade transition-colors hover:bg-jade/10"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              {successLabel}
            </a>
          )}

          {exportStatus === "error" && (
            <div
              className="animate-fade-up flex items-start gap-2 rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-800"
              role="status"
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                aria-hidden
              />
              <div>
                <p className="font-medium">Falha ao exportar</p>
                <p className="text-xs font-normal text-red-700/90">
                  Confira worker (PDF), Supabase e tente novamente. Word é
                  gerado no servidor Next.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExportPdf}
              disabled={busy}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition-all duration-200",
                "bg-ink-950 text-parchment hover:bg-ink-900 hover:shadow-lg",
                "active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 disabled:shadow-sm"
              )}
            >
              {busyPdf ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Gerando PDF…
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" aria-hidden />
                  Exportar PDF
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onExportDocx}
              disabled={busy}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-sm transition-all duration-200",
                "hover:border-ink-300 hover:bg-ink-50",
                "active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
              )}
            >
              {busyDocx ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Gerando Word…
                </>
              ) : (
                <>
                  <FileType2 className="h-4 w-4" aria-hidden />
                  Exportar Word
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
