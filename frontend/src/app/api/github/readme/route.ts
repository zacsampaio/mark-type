import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getGithubAccessToken } from "@/lib/auth-server";
import { fetchGithubReadmeMarkdown } from "@/lib/fetch-github-readme";

export async function GET(req: NextRequest) {
  const gh = await getGithubAccessToken(req);
  if (!gh) {
    return NextResponse.json(
      { error: "Faça login com GitHub para importar READMEs dos seus repositórios." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner")?.trim();
  const repo = searchParams.get("repo")?.trim();
  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Parâmetros owner e repo são obrigatórios." },
      { status: 400 }
    );
  }

  const result = await fetchGithubReadmeMarkdown(owner, repo, gh);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    markdown: result.markdown,
    repoName: result.repoName,
  });
}
