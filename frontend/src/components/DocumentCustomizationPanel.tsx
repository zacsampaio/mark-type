"use client";

import { useEffect, useRef } from "react";
import { RotateCcw, X } from "lucide-react";
import type { DocumentCustomization } from "@/lib/document-customization";
import {
  DEFAULT_DOCUMENT_CUSTOMIZATION,
  FONT_FAMILY_OPTIONS,
} from "@/lib/document-customization";
import { cn } from "@/lib/utils";

interface DocumentCustomizationPanelProps {
  open: boolean;
  onClose: () => void;
  value: DocumentCustomization;
  onChange: (next: DocumentCustomization) => void;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm text-ink-800">
      <span className="min-w-0 flex-1">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 shrink-0 cursor-pointer rounded border border-ink-200 bg-white p-0.5"
        aria-label={label}
      />
    </label>
  );
}

export function DocumentCustomizationPanel({
  open,
  onClose,
  value,
  onChange,
}: DocumentCustomizationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const t = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointer);
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-30 mt-2 w-[min(100vw-2rem,320px)] rounded-xl border border-ink-200 bg-white p-4 shadow-lg"
      role="dialog"
      aria-label="Personalização do documento"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink-900">Personalização</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <label className="block text-sm text-ink-800">
          <span className="mb-1.5 block font-medium">Tipo da fonte</span>
          <select
            value={
              FONT_FAMILY_OPTIONS.find((o) => o.fontFamily === value.fontFamily)
                ?.id ?? "serif"
            }
            onChange={(e) => {
              const opt = FONT_FAMILY_OPTIONS.find((o) => o.id === e.target.value);
              if (opt) onChange({ ...value, fontFamily: opt.fontFamily });
            }}
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-ink-950 focus:ring-2 focus:ring-ink-950/10"
          >
            {FONT_FAMILY_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2.5 border-t border-ink-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
            Cores das tabelas
          </p>
          <ColorField
            label="Cabeçalho (fundo)"
            value={value.tableHeaderBackground}
            onChange={(tableHeaderBackground) =>
              onChange({ ...value, tableHeaderBackground })
            }
          />
          <ColorField
            label="Cabeçalho (texto)"
            value={value.tableHeaderColor}
            onChange={(tableHeaderColor) =>
              onChange({ ...value, tableHeaderColor })
            }
          />
          <ColorField
            label="Linhas alternadas"
            value={value.tableRowAltBackground}
            onChange={(tableRowAltBackground) =>
              onChange({ ...value, tableRowAltBackground })
            }
          />
          <ColorField
            label="Bordas das células"
            value={value.tableBorderColor}
            onChange={(tableBorderColor) =>
              onChange({ ...value, tableBorderColor })
            }
          />
          <ColorField
            label="Texto do corpo"
            value={value.bodyColor}
            onChange={(bodyColor) => onChange({ ...value, bodyColor })}
          />
        </div>

        <button
          type="button"
          onClick={() => onChange({ ...DEFAULT_DOCUMENT_CUSTOMIZATION })}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 py-2 text-sm font-medium text-ink-700",
            "hover:bg-ink-50"
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar padrão
        </button>
      </div>
    </div>
  );
}
