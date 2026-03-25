"use client";

import { BookOpen, Github } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-ink-200/80 bg-parchment-50/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <BookOpen className="h-4 w-4 text-ink-400" aria-hidden />
          <span>
            <span className="font-medium text-ink-700">DocCraft</span>
            <span className="text-ink-400"> · Documentação a partir de Markdown</span>
          </span>
        </div>
        <nav
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-ink-500"
          aria-label="Links do rodapé"
        >
          <a
            href="https://github.com"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ink-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="h-3.5 w-3.5" aria-hidden />
            GitHub
          </a>
          <span className="hidden text-ink-200 sm:inline" aria-hidden>
            |
          </span>
          <span className="text-ink-400">Exporte PDF com templates profissionais</span>
        </nav>
        <p className="text-[11px] text-ink-400 lg:text-right">
          © {new Date().getFullYear()} DocCraft
        </p>
      </div>
    </footer>
  );
}
