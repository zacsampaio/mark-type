import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { createClient } from "@supabase/supabase-js";
import { syncGithubUserToSupabase } from "@/lib/sync-github-user-to-supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Auth.js exige `secret`. Em dev, sem .env, usamos fallback só para não quebrar o servidor local. */
const DEV_AUTH_SECRET_FALLBACK =
  "marktype-local-dev-only-not-for-production-min-32chars";

const authSecretFromEnv =
  process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();

const authSecret =
  authSecretFromEnv ||
  (process.env.NODE_ENV === "development" ? DEV_AUTH_SECRET_FALLBACK : "");

if (!authSecretFromEnv && process.env.NODE_ENV === "development") {
  console.warn(
    "[auth] AUTH_SECRET não definido — usando segredo de desenvolvimento. " +
      "Defina AUTH_SECRET em frontend/.env.local (openssl rand -base64 32)."
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(authSecret ? { secret: authSecret } : {}),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHub({
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
    Credentials({
      id: "credentials",
      name: "E-mail e senha",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (
          typeof email !== "string" ||
          typeof password !== "string" ||
          !email.trim() ||
          !password
        ) {
          return null;
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error || !data.user || !data.session) {
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email ?? "",
          name:
            (data.user.user_metadata?.full_name as string | undefined) ??
            undefined,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && account.providerAccountId) {
        await syncGithubUserToSupabase({
          user,
          profile,
          githubAccountId: account.providerAccountId,
        });
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "github" && account.access_token) {
        token.githubAccessToken = account.access_token;
        token.supabaseAccessToken = undefined;
        token.provider = "github";
      } else if (user && (user as { accessToken?: string }).accessToken) {
        token.supabaseAccessToken = (user as { accessToken?: string }).accessToken;
        token.githubAccessToken = undefined;
        token.provider = "credentials";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.accessToken = token.supabaseAccessToken as string | undefined;
        session.github = {
          connected: !!token.githubAccessToken,
        };
      }
      return session;
    },
  },
});
