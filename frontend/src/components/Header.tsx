"use client";

import Link from "next/link";
import { BookOpen, FolderGit2, Loader2, LogIn, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="shrink-0 border-b border-ink-200/90 bg-parchment-50/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-950 shadow-md ring-1 ring-ink-950/20">
            <BookOpen className="h-5 w-5 text-parchment" aria-hidden />
          </div>
          <div>
            <span className="font-display text-xl font-bold leading-tight text-ink-950">
              DocCraft
            </span>
            <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-ink-400">
              Gerador de documentação
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin text-ink-400" aria-hidden />
          ) : session?.user ? (
            <>
              {session.github?.connected && (
                <Link
                  href="/repos"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-ink-700",
                    "hover:border-ink-200 hover:bg-ink-50"
                  )}
                >
                  <FolderGit2 className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="max-w-[100px] truncate sm:max-w-none">
                    Repositórios
                  </span>
                </Link>
              )}
              <span
                className="hidden max-w-[180px] truncate text-sm text-ink-600 sm:inline"
                title={
                  session.user.email ??
                  session.user.name ??
                  undefined
                }
              >
                {session.user.email ?? session.user.name ?? "Conta"}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-sm transition-all duration-200",
                  "hover:border-ink-300 hover:bg-ink-50",
                  "active:scale-[0.98]"
                )}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-sm transition-all duration-200",
                "hover:border-ink-300 hover:bg-ink-50",
                "active:scale-[0.98]"
              )}
            >
              <LogIn className="h-4 w-4" aria-hidden />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
