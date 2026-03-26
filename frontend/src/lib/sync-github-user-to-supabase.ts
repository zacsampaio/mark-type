import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import type { User } from "next-auth";

type GithubProfile = {
  login?: string;
  id?: number;
  email?: string | null;
};

/**
 * Garante um registo em auth.users após login GitHub (NextAuth).
 * Usa a service_role no servidor — nunca expor no cliente.
 */
export async function syncGithubUserToSupabase(params: {
  user: User;
  profile?: unknown;
  githubAccountId: string;
}): Promise<void> {
  try {
    await syncGithubUserToSupabaseInner(params);
  } catch (e) {
    console.error("[sync-github-supabase] exceção (login GitHub continua):", e);
  }
}

async function syncGithubUserToSupabaseInner(params: {
  user: User;
  profile?: unknown;
  githubAccountId: string;
}): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!supabaseUrl || !serviceKey) {
    console.warn(
      "[sync-github-supabase] Ignorado: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para criar utilizador no Supabase."
    );
    return;
  }

  const { user, profile, githubAccountId } = params;
  const p = profile as GithubProfile | undefined;
  const login =
    typeof p?.login === "string" && p.login
      ? p.login
      : (user.name?.trim() || "github-user").replace(/\s+/g, "-");

  const rawEmail =
    typeof user.email === "string" && user.email.trim()
      ? user.email.trim()
      : typeof p?.email === "string" && p.email.trim()
        ? p.email.trim()
        : null;

  const numericId = /^\d+$/.test(githubAccountId) ? githubAccountId : "";
  const email =
    rawEmail ??
    (numericId
      ? `${numericId}+${login}@users.noreply.github.com`
      : `${login}@users.noreply.github.com`);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const user_metadata: Record<string, unknown> = {
    full_name: user.name ?? login,
    avatar_url: user.image ?? null,
    user_name: login,
    github_id: numericId || githubAccountId,
    provider: "github",
  };

  const { error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: randomBytes(32).toString("hex"),
    user_metadata,
  });

  if (!error) {
    return;
  }

  const msg = error.message?.toLowerCase() ?? "";
  const already =
    msg.includes("already been registered") ||
    msg.includes("already registered") ||
    msg.includes("duplicate") ||
    error.status === 422;

  if (already) {
    return;
  }

  console.error("[sync-github-supabase] createUser:", error.message);
}
