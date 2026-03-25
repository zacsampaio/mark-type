import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getGithubAccessToken } from "@/lib/auth-server";

export const maxDuration = 60;

type GithubRepoItem = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  default_branch: string;
  updated_at: string;
  html_url: string;
  fork: boolean;
};

export async function GET(req: NextRequest) {
  const gh = await getGithubAccessToken(req);
  if (!gh) {
    return NextResponse.json(
      {
        error:
          "É necessário entrar com GitHub (escopo de repositórios) para listar seus projetos.",
      },
      { status: 401 }
    );
  }

  const repos: GithubRepoItem[] = [];
  let page = 1;
  const maxPages = 15;

  while (page <= maxPages) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
      {
        headers: {
          Authorization: `Bearer ${gh}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "DocCraft/1.0",
        },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg =
        (err as { message?: string }).message ??
        `Falha ao listar repositórios (${res.status})`;
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const batch = (await res.json()) as GithubRepoItem[];
    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  const simplified = repos.map((r) => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    private: r.private,
    description: r.description,
    default_branch: r.default_branch,
    updated_at: r.updated_at,
    html_url: r.html_url,
    fork: r.fork,
  }));

  return NextResponse.json({ repos: simplified });
}
