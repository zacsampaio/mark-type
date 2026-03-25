"use client";

import { useMemo } from "react";
import { wordCount, estimateReadTime } from "@/lib/markdown";
import { templateLabel } from "@/lib/templates";
import type { Template } from "@/lib/types";

interface StatusBarProps {
  markdown: string;
  template: Template;
}

export function StatusBar({ markdown, template }: StatusBarProps) {
  const stats = useMemo(() => {
    const words = wordCount(markdown);
    const readTime = estimateReadTime(markdown);
    const lines = markdown.split("\n").length;
    const headings = (markdown.match(/^#+\s/gm) ?? []).length;
    const codeBlocks = (markdown.match(/```/g) ?? []).length / 2;

    return {
      words,
      readTime,
      lines,
      headings,
      codeBlocks: Math.floor(codeBlocks),
    };
  }, [markdown]);

  return (
    <div
      className="shrink-0 border-t border-ink-200/90 bg-gradient-to-b from-ink-50/90 to-parchment-50/95 px-4 py-3 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-ink-500 sm:text-xs">
          <Stat label="Palavras" value={stats.words.toLocaleString()} />
          <Sep />
          <Stat label="Linhas" value={stats.lines.toLocaleString()} />
          <Sep />
          <Stat label="Títulos" value={stats.headings} />
          <Sep />
          <Stat label="Blocos de código" value={stats.codeBlocks} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-ink-500 sm:text-xs">
          <Stat label="Leitura" value={`~${stats.readTime} min`} />
          <Sep />
          <span className="font-medium text-ink-700">
            {templateLabel(template)}
          </span>
          <Sep />
          <span className="text-ink-400">Markdown</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-ink-400">{label}: </span>
      <span className="font-semibold text-ink-600">{value}</span>
    </span>
  );
}

function Sep() {
  return (
    <span className="hidden text-ink-200 sm:inline" aria-hidden>
      ·
    </span>
  );
}
