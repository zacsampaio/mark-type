"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Github,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorTabBar, type EditorTab } from "@/components/EditorTabBar";
import { OrientacoesTab } from "@/components/OrientacoesTab";

interface EditorPanelProps {
  markdown: string;
  onMarkdownChange: (value: string) => void;
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  /** Oculta abas no desktop (renderizadas em WorkspaceActionRow) */
  hideTabBarOnDesktop?: boolean;
  /** Preenchido ao voltar da página de repositórios com import pendente */
  importedRepoName?: string | null;
  /** Incrementa a cada novo import (permite reimportar o mesmo repo) */
  importToken?: number;
  onImportedRepoConsumed?: () => void;
}

export function EditorPanel({
  markdown,
  onMarkdownChange,
  activeTab,
  onTabChange,
  hideTabBarOnDesktop = false,
  importedRepoName,
  importToken = 0,
  onImportedRepoConsumed,
}: EditorPanelProps) {
  const [githubUrl, setGithubUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [githubError, setGithubError] = useState("");
  const [repoName, setRepoName] = useState("");

  useEffect(() => {
    if (!importedRepoName || importToken === 0) return;
    setRepoName(importedRepoName);
    onTabChange("paste");
    onImportedRepoConsumed?.();
  }, [importedRepoName, importToken, onImportedRepoConsumed, onTabChange]);

  const handleImportGithub = useCallback(async () => {
    if (!githubUrl.trim()) return;
    setIsFetching(true);
    setGithubError("");
    setRepoName("");

    try {
      const res = await fetch("/api/import-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: githubUrl }),
      });
      const data = await res.json();
      if (data.markdown) {
        onMarkdownChange(data.markdown);
        setRepoName(data.repoName ?? "");
        onTabChange("paste");
      } else {
        setGithubError(data.error ?? "Failed to fetch README");
      }
    } catch {
      setGithubError("Network error — please try again");
    } finally {
      setIsFetching(false);
    }
  }, [githubUrl, onMarkdownChange, onTabChange]);

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "border-b border-ink-200/90",
          hideTabBarOnDesktop && "lg:hidden"
        )}
      >
        <EditorTabBar activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {activeTab === "paste" && (
          <PasteTab
            markdown={markdown}
            onChange={onMarkdownChange}
            repoName={repoName}
          />
        )}
        {activeTab === "github" && (
          <GithubTab
            url={githubUrl}
            onUrlChange={setGithubUrl}
            onImport={handleImportGithub}
            isFetching={isFetching}
            error={githubError}
          />
        )}
        {activeTab === "orientacoes" && <OrientacoesTab />}
      </div>
    </div>
  );
}

function PasteTab({
  markdown,
  onChange,
  repoName,
}: {
  markdown: string;
  onChange: (v: string) => void;
  repoName: string;
}) {
  return (
    <div className="relative flex-1">
      {repoName && (
        <div className="flex items-center gap-2 border-b border-jade/20 bg-jade/10 px-5 py-2.5 sm:px-6">
          <Sparkles className="h-3.5 w-3.5 text-jade" />
          <span className="text-xs font-medium text-jade">
            Importado de <strong>{repoName}</strong>
          </span>
        </div>
      )}
      <textarea
        value={markdown}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-full min-h-[200px] w-full resize-none border-0 bg-transparent font-mono text-sm leading-relaxed text-ink-800 outline-none placeholder:text-ink-300",
          "px-5 py-5 sm:px-6 sm:py-6",
          "focus:ring-0"
        )}
        style={{ minHeight: "min(55vh, 480px)" }}
        placeholder="# Seu README\n\nCole o Markdown aqui..."
        spellCheck={false}
      />
    </div>
  );
}

function GithubTab({
  url,
  onUrlChange,
  onImport,
  isFetching,
  error,
}: {
  url: string;
  onUrlChange: (v: string) => void;
  onImport: () => void;
  isFetching: boolean;
  error: string;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onImport();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-start gap-6 overflow-y-auto px-8 pt-[100px]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100">
        <Github className="h-8 w-8 text-ink-600" />
      </div>

      <div className="text-center">
        <h3 className="mb-1 font-display text-lg font-semibold text-ink-950">
          Importar do GitHub
        </h3>
        <p className="text-sm text-ink-400">
          Cole a URL do repositório para buscar o README.md
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://github.com/usuario/repo"
            className={cn(
              "w-full rounded-xl border border-ink-200 bg-parchment px-4 py-3 font-mono text-sm text-ink-800 outline-none placeholder:text-ink-300",
              "transition-all focus:border-ink-950 focus:ring-2 focus:ring-ink-950/10",
              error && "border-red-400 focus:border-red-400"
            )}
          />
        </div>

        {error && (
          <div className="animate-fade-up flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={onImport}
          disabled={isFetching || !url.trim()}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-parchment",
            "bg-ink-950 transition-all hover:bg-ink-800 active:scale-[0.98]",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          )}
        >
          {isFetching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando README…
            </>
          ) : (
            <>
              Importar README
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-ink-300">
          Repositórios públicos
        </p>
      </div>

      <div className="w-full max-w-sm">
        <p className="mb-2 text-xs font-medium text-ink-400">Exemplos:</p>
        <div className="flex flex-wrap gap-2">
          {["facebook/react", "vercel/next.js", "tailwindlabs/tailwindcss"].map(
            (repo) => (
              <button
                key={repo}
                type="button"
                onClick={() => onUrlChange(`https://github.com/${repo}`)}
                className="rounded-md bg-ink-100 px-2.5 py-1 font-mono text-xs text-ink-600 transition-colors hover:bg-ink-200 hover:text-ink-900"
              >
                {repo}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
