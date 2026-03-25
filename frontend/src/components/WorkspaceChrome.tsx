"use client";

import { Eye, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Template } from "@/lib/templates";
import { templateLabel } from "@/lib/templates";
import type { WorkspaceMobileTab } from "@/components/WorkspaceTabs";

interface WorkspaceChromeProps {
  mobileTab: WorkspaceMobileTab;
  template: Template;
}

export function WorkspaceChrome({ mobileTab, template }: WorkspaceChromeProps) {
  return (
    <div className="shrink-0 border-b border-ink-200/90 bg-white/95">
      <div className="hidden min-h-[3.25rem] lg:grid lg:grid-cols-2">
        <div className="flex items-center border-r border-ink-200/80 px-5 sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            Entrada
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Eye className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Pré-visualização
            </span>
          </div>
          <PreviewLiveMeta template={template} />
        </div>
      </div>

      <div className="flex min-h-[3.25rem] items-center border-b border-ink-200/80 px-5 sm:px-6 lg:hidden">
        {mobileTab === "edit" ? (
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            Entrada
          </span>
        ) : (
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Eye className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                Pré-visualização
              </span>
            </div>
            <PreviewLiveMeta template={template} compact />
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewLiveMeta({
  template,
  compact,
}: {
  template: Template;
  compact?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        className={cn(
          "rounded-full bg-ink-100 px-2.5 py-0.5 text-[11px] font-medium text-ink-700",
          compact && "max-w-[140px] truncate sm:max-w-none"
        )}
        title={templateLabel(template)}
      >
        {templateLabel(template)}
      </span>
      <span className="text-[11px] text-ink-400">Ao vivo</span>
      <RefreshCw
        className="h-3 w-3 shrink-0 text-ink-300 animate-spin [animation-duration:3s]"
        aria-hidden
      />
    </div>
  );
}
