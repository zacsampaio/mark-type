"use client";

import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewPageControlsProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function NavButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-700 transition-colors",
        "hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"
      )}
    >
      {children}
    </button>
  );
}

export function PreviewPageControls({
  page,
  pageCount,
  onPageChange,
  className,
}: PreviewPageControlsProps) {
  const atStart = page <= 1;
  const atEnd = page >= pageCount;

  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-ink-200/90 bg-parchment-50/90 px-3 py-2.5 sm:gap-3 sm:px-4",
        className
      )}
      role="navigation"
      aria-label="Paginação da pré-visualização"
    >
      <div className="flex items-center gap-1">
        <NavButton
          label="Primeira página"
          disabled={atStart}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden />
        </NavButton>
        <NavButton
          label="Página anterior"
          disabled={atStart}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </NavButton>
        <NavButton
          label="Próxima página"
          disabled={atEnd}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </NavButton>
        <NavButton
          label="Última página"
          disabled={atEnd}
          onClick={() => onPageChange(pageCount)}
        >
          <ChevronsRight className="h-4 w-4" aria-hidden />
        </NavButton>
      </div>
      <p className="text-xs font-medium text-ink-600 sm:text-sm" aria-live="polite">
        Página{" "}
        <span className="font-semibold text-ink-900">{page}</span> de{" "}
        <span className="font-semibold text-ink-900">{pageCount}</span>
      </p>
    </div>
  );
}
