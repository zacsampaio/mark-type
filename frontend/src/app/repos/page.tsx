"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ArrowLeft, Github, Loader2, Lock, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";
import { cn } from "@/lib/utils";
import {
  TRANSLATION_LANGUAGES,
  type TranslationTarget,
} from "@/lib/translation-languages";
import { PENDING_IMPORT_STORAGE_KEY } from "@/lib/pending-import";

type RepoRow = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  updated_at: string;
  html_url: string;
  fork: boolean;
};

export default function ReposPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<RepoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [langByRepo, setLangByRepo] = useState<Record<string, TranslationTarget>>(
    {}
  );

  const githubConnected = session?.github?.connected === true;

  const loadRepos = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/github/repos");
      const data = await res.json();
      if (!res.ok) {
        setListError(
          typeof data.error === "string" ? data.error : "Falha ao carregar."
        );
        setRepos([]);
        return;
      }
      setRepos(Array.isArray(data.repos) ? data.repos : []);
    } catch {
      setListError("Erro de rede ao carregar repositórios.");
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !githubConnected) return;
    void loadRepos();
  }, [status, githubConnected, loadRepos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false)
    );
  }, [repos, query]);

  function pushToEditor(markdown: string, repoName: string) {
    const payload = JSON.stringify({ markdown, repoName });
    sessionStorage.setItem(PENDING_IMPORT_STORAGE_KEY, payload);
    router.push("/");
  }

  async function importReadme(fullName: string) {
    const [owner, repo] = fullName.split("/");
    if (!owner || !repo) return;
    setRowBusy(fullName);
    setRowError(null);
    try {
      const res = await fetch(
        `/api/github/readme?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setRowError(
          typeof data.error === "string" ? data.error : "Falha ao importar."
        );
        return;
      }
      if (typeof data.markdown === "string") {
        pushToEditor(data.markdown, data.repoName ?? fullName);
      }
    } catch {
      setRowError("Erro de rede ao importar README.");
    } finally {
      setRowBusy(null);
    }
  }

  async function translateAndOpen(fullName: string) {
    const [owner, repo] = fullName.split("/");
    if (!owner || !repo) return;
    const targetLang =
      langByRepo[fullName] ?? ("pt-BR" satisfies TranslationTarget);
    setRowBusy(fullName);
    setRowError(null);
    try {
      const r1 = await fetch(
        `/api/github/readme?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
      );
      const d1 = await r1.json();
      if (!r1.ok) {
        setRowError(
          typeof d1.error === "string" ? d1.error : "Falha ao ler README."
        );
        return;
      }
      const markdown = d1.markdown as string;
      const tr = await fetch("/api/translate-markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown, targetLang }),
      });
      const d2 = await tr.json();
      if (!tr.ok) {
        setRowError(
          typeof d2.error === "string"
            ? d2.error
            : "Tradução indisponível."
        );
        return;
      }
      if (typeof d2.markdown === "string") {
        pushToEditor(
          d2.markdown,
          `${d1.repoName ?? fullName} (traduzido)`
        );
      }
    } catch {
      setRowError("Erro de rede na tradução.");
    } finally {
      setRowBusy(null);
    }
  }

  return (
    <div className="doccraft-app flex min-h-dvh flex-col bg-parchment bg-paper-texture">
      <Header />

      <div className="flex min-h-0 flex-1 flex-col px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-[960px] flex-1 rounded-2xl border border-ink-200/90 bg-white/95 p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href="/"
                className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-950"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Voltar ao editor
              </Link>
              <h1 className="font-display text-2xl font-bold text-ink-950">
                Seus repositórios GitHub
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Importe o README no DocCraft ou gere uma versão traduzida do
                Markdown (requer OpenAI no servidor).
              </p>
            </div>
          </div>

          {status === "loading" && (
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Verificando sessão…
            </div>
          )}

          {status === "unauthenticated" && (
            <div className="rounded-xl border border-ink-200 bg-ink-50/80 p-6 text-center">
              <p className="text-sm text-ink-700">
                Entre para acessar seus repositórios.
              </p>
              <Link
                href="/login?callbackUrl=/repos"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-ink-950 px-5 py-2.5 text-sm font-semibold text-parchment"
              >
                Ir para login
              </Link>
            </div>
          )}

          {status === "authenticated" && !githubConnected && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-6">
              <div className="flex items-start gap-3">
                <Github className="mt-0.5 h-5 w-5 text-amber-800" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-amber-950">
                    Conecte o GitHub para listar repositórios
                  </p>
                  <p className="mt-1 text-sm text-amber-900/90">
                    Sua sessão atual é por e-mail. Autorize o acesso aos
                    repositórios com OAuth (escopo <code className="rounded bg-amber-100 px-1 font-mono text-xs">repo</code>).
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      signIn("github", { callbackUrl: "/repos" })
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink-950 px-4 py-2.5 text-sm font-semibold text-parchment"
                  >
                    <Github className="h-4 w-4" aria-hidden />
                    Entrar com GitHub
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === "authenticated" && githubConnected && (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filtrar por nome ou descrição…"
                    className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-ink-950 focus:ring-2 focus:ring-ink-950/10"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void loadRepos()}
                  disabled={loading}
                  className="shrink-0 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-800 hover:bg-ink-50 disabled:opacity-50"
                >
                  Atualizar lista
                </button>
              </div>

              {listError && (
                <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {listError}
                </p>
              )}
              {rowError && (
                <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {rowError}
                </p>
              )}

              {loading && repos.length === 0 ? (
                <div className="flex items-center gap-2 py-12 text-sm text-ink-500">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                  Carregando repositórios…
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-ink-500">
                  Nenhum repositório encontrado.
                </p>
              ) : (
                <ul className="divide-y divide-ink-100 rounded-xl border border-ink-200/80">
                  {filtered.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-ink-950">
                            {r.full_name}
                          </span>
                          {r.private && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium uppercase text-ink-600">
                              <Lock className="h-3 w-3" aria-hidden />
                              Privado
                            </span>
                          )}
                          {r.fork && (
                            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-600">
                              Fork
                            </span>
                          )}
                        </div>
                        {r.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-ink-500">
                            {r.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={langByRepo[r.full_name] ?? "pt-BR"}
                            onChange={(e) =>
                              setLangByRepo((prev) => ({
                                ...prev,
                                [r.full_name]: e.target
                                  .value as TranslationTarget,
                              }))
                            }
                            className="rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-800"
                            aria-label={`Idioma de tradução para ${r.full_name}`}
                          >
                            {TRANSLATION_LANGUAGES.map((l) => (
                              <option key={l.value} value={l.value}>
                                Traduzir → {l.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={rowBusy === r.full_name}
                            onClick={() => void importReadme(r.full_name)}
                            className={cn(
                              "rounded-lg bg-ink-950 px-3 py-2 text-xs font-semibold text-parchment",
                              "hover:bg-ink-900 disabled:opacity-50"
                            )}
                          >
                            {rowBusy === r.full_name ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Importar README"
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={rowBusy === r.full_name}
                            onClick={() => void translateAndOpen(r.full_name)}
                            className={cn(
                              "rounded-lg border border-ink-300 bg-white px-3 py-2 text-xs font-semibold text-ink-900",
                              "hover:bg-ink-50 disabled:opacity-50"
                            )}
                          >
                            Traduzir e abrir
                          </button>
                          <a
                            href={r.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-ink-200 px-3 py-2 text-xs font-medium text-ink-700 hover:bg-ink-50"
                          >
                            Abrir no GitHub
                          </a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
