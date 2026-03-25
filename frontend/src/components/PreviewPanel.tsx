"use client";

import { useMemo } from "react";
import { markdownToHtml, parseMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import type { Template } from "@/lib/types";
import { TEMPLATE_OPTIONS } from "@/lib/templates";

interface PreviewPanelProps {
  markdown: string;
  template: Template;
  onTemplateChange: (t: Template) => void;
}

export function PreviewPanel({
  markdown,
  template,
  onTemplateChange,
}: PreviewPanelProps) {
  const { html, parsed } = useMemo(() => {
    const parsed = parseMarkdown(markdown);
    const html = markdownToHtml(markdown);
    return { html, parsed };
  }, [markdown]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-ink-200/90 bg-gradient-to-b from-white to-ink-50/30 px-5 py-3 sm:px-6">
        <label
          htmlFor="preview-template-select"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-ink-500"
        >
          Modelo do documento
        </label>
        <select
          id="preview-template-select"
          value={template}
          onChange={(e) => onTemplateChange(e.target.value as Template)}
          className="w-full max-w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-3 pr-8 text-sm font-medium text-ink-900 shadow-sm outline-none focus:border-ink-950 focus:ring-2 focus:ring-ink-950/10 sm:max-w-md"
        >
          {TEMPLATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} — {opt.description}
            </option>
          ))}
        </select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          {template === "professional" && (
            <ProfessionalDocument
              html={html}
              title={parsed.title}
              description={parsed.description}
            />
          )}
          {template === "modern" && (
            <ModernDocument
              html={html}
              title={parsed.title}
              description={parsed.description}
            />
          )}
          {template === "saas" && (
            <SaasDocument
              html={html}
              title={parsed.title}
              description={parsed.description}
            />
          )}
          {template === "document" && (
            <DocumentPlain
              html={html}
              title={parsed.title}
              description={parsed.description}
            />
          )}
          {template === "compliance" && (
            <ComplianceDocument
              html={html}
              title={parsed.title}
              description={parsed.description}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfessionalDocument({
  html,
  title,
  description,
}: {
  html: string;
  title: string;
  description?: string;
}) {
  return (
    <div
      className="doc-preview template-professional"
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      <div className="doc-cover mb-10 border-b-2 border-ink-950 py-10 text-center">
        <div className="mb-4 font-body text-xs uppercase tracking-[0.2em] text-ink-400">
          Documentação técnica
        </div>
        <h1
          className="mb-3 font-display text-4xl font-bold leading-tight text-ink-950"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h1>
        {description && (
          <p className="mx-auto max-w-md font-body text-base italic text-ink-500">
            {description}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-4 font-body text-xs text-ink-400">
          <span>
            {new Date().toLocaleDateString("pt-BR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>·</span>
          <span>DocCraft</span>
        </div>
      </div>
      <div
        className="doc-preview template-professional"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      />
    </div>
  );
}

function ModernDocument({
  html,
  title,
  description,
}: {
  html: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="doc-preview template-modern">
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-ink-950 px-8 py-10">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #c0651a 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2d6a4f 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade-light" />
            <span className="font-body text-xs tracking-wide text-parchment/60">
              Documentação
            </span>
          </div>
          <h1 className="mb-3 font-body text-4xl font-semibold leading-tight text-parchment">
            {title}
          </h1>
          {description && (
            <p className="max-w-md font-body text-sm leading-relaxed text-parchment/60">
              {description}
            </p>
          )}
          <div className="mt-6 font-body text-xs text-parchment/40">
            DocCraft · {new Date().getFullYear()}
          </div>
        </div>
      </div>
      <div
        className="doc-preview template-modern"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function SaasDocument({
  html,
  title,
  description,
}: {
  html: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="doc-preview template-saas">
      <div className="mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-8 shadow-sm">
        <span className="mb-3 inline-block rounded-md bg-blue-600 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-white">
          Product docs
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm text-slate-600">{description}</p>
        )}
        <p className="mt-4 font-mono text-xs text-slate-400">
          v1 · {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function DocumentPlain({
  html,
  title,
  description,
}: {
  html: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="doc-preview template-document max-w-[640px]">
      <header className="mb-8 border-b border-neutral-300 pb-6">
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-neutral-600">{description}</p>
        )}
        <p className="mt-4 text-xs text-neutral-500">
          {new Date().toLocaleDateString("pt-BR")} · documento para leitura e
          impressão
        </p>
      </header>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function ComplianceDocument({
  html,
  title,
  description,
}: {
  html: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="doc-preview template-compliance">
      <div
        className={cn(
          "mb-6 border-2 border-neutral-900 bg-neutral-100 px-4 py-3 font-body text-xs font-semibold uppercase tracking-wide text-neutral-900"
        )}
      >
        Documento para conformidade e auditoria — aplicar políticas internas e
        revisões periódicas.
      </div>
      <div className="mb-8 border-b-2 border-neutral-900 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-neutral-700">{description}</p>
        )}
        <p className="mt-4 text-xs text-neutral-500">
          Classificação: interno · Última atualização:{" "}
          {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
