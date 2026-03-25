const README_CANDIDATES = ["README.md", "readme.md", "Readme.md", "README.MD"];

export async function fetchGithubReadmeMarkdown(
  owner: string,
  repo: string,
  token: string
): Promise<
  | { ok: true; markdown: string; repoName: string }
  | { ok: false; error: string; status: number }
> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.raw",
    "User-Agent": "DocCraft/1.0",
    Authorization: `Bearer ${token}`,
  };

  for (const filename of README_CANDIDATES) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`;
    const res = await fetch(apiUrl, { headers });
    if (res.ok) {
      const markdown = await res.text();
      return {
        ok: true,
        markdown,
        repoName: `${owner}/${repo}`,
      };
    }
    if (res.status !== 404) {
      const errorBody = await res.json().catch(() => ({}));
      const message =
        res.status === 403
          ? "Sem permissão para ler este repositório (verifique o escopo OAuth)."
          : res.status === 401
            ? "Token GitHub inválido ou expirado. Entre novamente com GitHub."
            : (errorBody as { message?: string }).message ??
              `Erro na API do GitHub (${res.status})`;
      return { ok: false, error: message, status: res.status };
    }
  }

  return {
    ok: false,
    error: `Nenhum README.md encontrado em ${owner}/${repo}`,
    status: 404,
  };
}
