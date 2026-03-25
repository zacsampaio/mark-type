import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

function authSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

/** Em HTTPS (ex.: Vercel) o cookie de sessão usa prefixo `__Secure-`; getToken precisa do mesmo. */
function secureCookieForRequest(req: NextRequest): boolean {
  return req.nextUrl.protocol === "https:";
}

export async function getGithubAccessToken(
  req: NextRequest
): Promise<string | null> {
  const secret = authSecret();
  if (!secret) return null;
  const token = await getToken({
    req,
    secret,
    secureCookie: secureCookieForRequest(req),
  });
  const t = token?.githubAccessToken;
  return typeof t === "string" && t.length > 0 ? t : null;
}

export async function getAuthenticatedUserId(
  req: NextRequest
): Promise<string | null> {
  const secret = authSecret();
  if (!secret) return null;
  const token = await getToken({
    req,
    secret,
    secureCookie: secureCookieForRequest(req),
  });
  const sub = token?.sub;
  return typeof sub === "string" ? sub : null;
}
