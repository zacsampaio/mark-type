import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    github?: {
      connected: boolean;
    };
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    supabaseAccessToken?: string;
    githubAccessToken?: string;
    provider?: string;
  }
}
