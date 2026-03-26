"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ArrowLeft, Github } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const callbackUrlParam = searchParams.get("callbackUrl");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(safeCallbackUrl(callbackUrlParam));
    }
  }, [status, router, callbackUrlParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      if (mode === "signup") {
        if (password !== passwordConfirm) {
          setError("As senhas não coincidem.");
          setSubmitting(false);
          return;
        }
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            passwordConfirm,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(
            typeof data.error === "string" ? data.error : "Cadastro falhou."
          );
          setSubmitting(false);
          return;
        }
        if (data.needsEmailConfirmation) {
          setInfo(
            "Enviamos um link de confirmação para seu e-mail. Depois de confirmar, volte aqui para entrar."
          );
          setPassword("");
          setPasswordConfirm("");
          setMode("login");
          setSubmitting(false);
          return;
        }
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (!signInRes?.ok) {
          setError(
            "Conta criada, mas o login automático falhou. Tente entrar manualmente."
          );
          setSubmitting(false);
          return;
        }
        router.push(safeCallbackUrl(callbackUrlParam));
        router.refresh();
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!signInRes?.ok) {
        setError("E-mail ou senha inválidos.");
        setSubmitting(false);
        return;
      }
      router.push(safeCallbackUrl(callbackUrlParam));
      router.refresh();
    } catch {
      setError("Algo deu errado. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="marktype-app flex min-h-dvh items-center justify-center bg-parchment bg-paper-texture">
        <p className="text-sm text-ink-500">Carregando…</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="marktype-app flex min-h-dvh flex-col bg-parchment bg-paper-texture">
      <header className="shrink-0 border-b border-ink-200/90 bg-parchment-50/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-950"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar ao app
          </Link>
          <div className="flex items-center gap-3">
            <BrandLogo
              size={36}
              className="h-9 w-9 shrink-0 rounded-lg shadow-md ring-1 ring-ink-950/20"
            />
            <span className="font-display text-lg font-bold text-ink-950">
              MarkType
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-ink-200/90 bg-white/95 p-6 shadow-[0_4px_6px_-1px_rgba(35,30,24,0.06),0_20px_40px_-12px_rgba(35,30,24,0.12)] backdrop-blur-sm sm:p-8">
          <h1 className="font-display text-2xl font-bold text-ink-950">
            Acesse sua conta
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Entre ou crie uma conta, ou use GitHub para listar repositórios e
            importar READMEs.
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={() =>
                signIn("github", {
                  callbackUrl: safeCallbackUrl(callbackUrlParam),
                })
              }
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink-200 bg-ink-950 py-3 text-sm font-semibold text-parchment shadow-md transition-all",
                "hover:bg-ink-900 hover:shadow-lg active:scale-[0.99]"
              )}
            >
              <Github className="h-4 w-4" aria-hidden />
              Entrar com GitHub
            </button>
            <p className="mt-2 text-center text-[11px] leading-snug text-ink-400">
              Solicitamos escopo <code className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[10px]">repo</code> para ler seus repositórios e o README.
            </p>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-ink-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-white px-3 text-ink-400">ou e-mail</span>
            </div>
          </div>

          <div
            className="flex rounded-xl border border-ink-200 bg-ink-50/80 p-1"
            role="tablist"
            aria-label="Modo de autenticação"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => {
                setMode("login");
                setError(null);
                setInfo(null);
              }}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                mode === "login"
                  ? "bg-white text-ink-950 shadow-sm"
                  : "text-ink-500 hover:text-ink-800"
              )}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              onClick={() => {
                setMode("signup");
                setError(null);
                setInfo(null);
              }}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                mode === "signup"
                  ? "bg-white text-ink-950 shadow-sm"
                  : "text-ink-500 hover:text-ink-800"
              )}
            >
              Cadastrar
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {info && (
              <p
                className="rounded-lg border border-jade/30 bg-jade/10 px-3 py-2 text-sm text-jade"
                role="status"
              >
                {info}
              </p>
            )}
            {error && (
              <p
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {error}
              </p>
            )}
            <div>
              <label
                htmlFor="auth-email"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500"
              >
                E-mail
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm outline-none focus:border-ink-950 focus:ring-2 focus:ring-ink-950/10"
                placeholder="voce@exemplo.com"
              />
            </div>
            <div>
              <label
                htmlFor="auth-password"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500"
              >
                Senha
              </label>
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm outline-none focus:border-ink-950 focus:ring-2 focus:ring-ink-950/10"
                placeholder="••••••••"
              />
            </div>

            {mode === "signup" && (
              <div>
                <label
                  htmlFor="auth-password-confirm"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500"
                >
                  Confirmar senha
                </label>
                <input
                  id="auth-password-confirm"
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm outline-none focus:border-ink-950 focus:ring-2 focus:ring-ink-950/10"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl border-2 border-ink-200 bg-white py-3 text-sm font-semibold text-ink-950 shadow-sm transition-all hover:bg-ink-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Aguarde…"
                : mode === "login"
                  ? "Entrar com e-mail"
                  : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-400">
            E-mail via Supabase · GitHub via Auth.js (o servidor cria/atualiza o
            utilizador em Auth com a service role, se estiver configurada).
          </p>
        </div>
      </main>
    </div>
  );
}
