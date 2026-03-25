import { NextRequest, NextResponse } from "next/server";
import { markdownToHtml, parseMarkdown } from "@/lib/markdown";

export async function POST(req: NextRequest) {
  try {
    const { markdown } = await req.json();

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json(
        { error: "markdown field is required" },
        { status: 400 }
      );
    }

    const parsed = parseMarkdown(markdown);
    const html = markdownToHtml(markdown);

    return NextResponse.json({ ...parsed, html });
  } catch (err) {
    console.error("[parse-markdown]", err);
    return NextResponse.json({ error: "Failed to parse markdown" }, { status: 500 });
  }
}
