import { NextRequest, NextResponse } from "next/server";

function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("github.com")) return null;
    const parts = u.pathname.replace(/^\//, "").replace(/\/$/, "").split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { repoUrl } = await req.json();

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { error: "repoUrl is required" },
        { status: 400 }
      );
    }

    const parsed = parseGithubUrl(repoUrl.trim());
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid GitHub URL. Expected: https://github.com/owner/repo" },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    // Try common README filenames
    const candidates = ["README.md", "readme.md", "Readme.md", "README.MD"];
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "DocCraft/1.0",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let markdown: string | null = null;

    for (const filename of candidates) {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`;
      const res = await fetch(apiUrl, { headers });
      if (res.ok) {
        markdown = await res.text();
        break;
      }
      // 404 → try next candidate; other errors → bail
      if (res.status !== 404) {
        const errorBody = await res.json().catch(() => ({}));
        const message =
          res.status === 403
            ? "GitHub API rate limit reached. Set GITHUB_TOKEN env var for higher limits."
            : res.status === 401
            ? "GitHub token is invalid or expired."
            : (errorBody as { message?: string }).message ?? `GitHub API error: ${res.status}`;
        return NextResponse.json({ error: message }, { status: res.status });
      }
    }

    if (!markdown) {
      return NextResponse.json(
        { error: `No README.md found in ${owner}/${repo}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      markdown,
      repoName: `${owner}/${repo}`,
    });
  } catch (err) {
    console.error("[import-github]", err);
    return NextResponse.json(
      { error: "Failed to fetch README from GitHub" },
      { status: 500 }
    );
  }
}
