"use client";

import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { markdownToHtml } from "@/lib/markdown";
import { ORIENTACOES_MARKDOWN } from "@/lib/orientacoes-markdown";
export function OrientacoesTab() {
  const html = useMemo(() => markdownToHtml(ORIENTACOES_MARKDOWN), []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center gap-2 border-b border-ink-200/80 bg-parchment-50/80 px-5 py-3 sm:px-6">
        <BookOpen className="h-4 w-4 text-ink-600" aria-hidden />
        <span className="text-sm font-semibold text-ink-900">Orientações</span>
      </div>
      <div
        className="orientacoes-panel min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6"
      >
        <div
          className="orientacoes-panel__content max-w-none text-sm leading-relaxed text-ink-800"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
