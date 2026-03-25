"use client";

import { FileText, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceMobileTab = "edit" | "preview";

interface WorkspaceTabsProps {
  active: WorkspaceMobileTab;
  onChange: (tab: WorkspaceMobileTab) => void;
}

export function WorkspaceTabs({ active, onChange }: WorkspaceTabsProps) {
  return (
    <div
      className="flex shrink-0 border-b border-ink-200 bg-ink-50/80 px-2 py-2 lg:hidden"
      role="tablist"
      aria-label="Alternar entre editor e pré-visualização"
    >
      <button
        type="button"
        role="tab"
        aria-selected={active === "edit"}
        onClick={() => onChange("edit")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
          active === "edit"
            ? "bg-white text-ink-950 shadow-sm ring-1 ring-ink-200/80"
            : "text-ink-500 hover:bg-white/60 hover:text-ink-800"
        )}
      >
        <FileText className="h-4 w-4" aria-hidden />
        Editor
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "preview"}
        onClick={() => onChange("preview")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
          active === "preview"
            ? "bg-white text-ink-950 shadow-sm ring-1 ring-ink-200/80"
            : "text-ink-500 hover:bg-white/60 hover:text-ink-800"
        )}
      >
        <Eye className="h-4 w-4" aria-hidden />
        Pré-visualização
      </button>
    </div>
  );
}
