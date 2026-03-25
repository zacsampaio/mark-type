import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-server";

const ALLOWED_LANGS = new Set<string>([
  "pt-BR",
  "en",
  "es",
  "fr",
  "de",
  "it",
  "ja",
  "zh-CN",
]);

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Faça login para traduzir." }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Tradução não configurada: defina OPENAI_API_KEY no servidor (frontend/.env.local).",
      },
      { status: 503 }
    );
  }

  let body: { markdown?: unknown; targetLang?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const markdown =
    typeof body.markdown === "string" ? body.markdown : "";
  const targetLang = body.targetLang;

  if (!markdown.trim()) {
    return NextResponse.json({ error: "Markdown vazio." }, { status: 400 });
  }
  if (typeof targetLang !== "string" || !ALLOWED_LANGS.has(targetLang)) {
    return NextResponse.json({ error: "Idioma de destino inválido." }, { status: 400 });
  }

  const langLabel = targetLang;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATE_MODEL ?? "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You translate Markdown documentation. Preserve all code blocks, fenced code, tables, links, and image syntax exactly in structure; only translate human-readable text. Output only the translated Markdown, no preamble.",
        },
        {
          role: "user",
          content: `Translate the following Markdown into the locale/language identified as "${langLabel}". Keep technical terms in English when usual in that locale.\n\n---\n\n${markdown}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg =
      (err as { error?: { message?: string } }).error?.message ??
      `OpenAI error (${res.status})`;
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const translated = data.choices?.[0]?.message?.content?.trim();
  if (!translated) {
    return NextResponse.json(
      { error: "Resposta de tradução vazia." },
      { status: 502 }
    );
  }

  return NextResponse.json({ markdown: translated });
}
