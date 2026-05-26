import type { ParsedDocument, Section } from "./types";

export function parseMarkdown(input: string): ParsedDocument {
  const lines = input.split("\n");
  let title = "Untitled Document";
  let description = "";
  const sections: Section[] = [];

  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) { title = h1[1].trim(); break; }
  }

  for (const line of lines) {
    const bq = line.match(/^>\s+(.+)/);
    if (bq) { description = bq[1].trim(); break; }
  }

  let currentSection: Section | null = null;
  let sectionContent: string[] = [];

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+)/);
    if (heading) {
      if (currentSection) {
        currentSection.content = sectionContent.join("\n");
        sections.push(currentSection);
        sectionContent = [];
      }
      const level = heading[1].length;
      const text = heading[2].trim();
      currentSection = {
        id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        heading: text,
        level,
        content: "",
      };
    } else {
      sectionContent.push(line);
    }
  }

  if (currentSection) {
    currentSection.content = sectionContent.join("\n");
    sections.push(currentSection);
  }

  return { title, description, sections, rawHtml: markdownToHtml(input) };
}

const CODE_BLOCK_PLACEHOLDER = "\uE000CODEBLOCK";

function extractCodeBlocks(markdown: string): {
  markdown: string;
  blocks: string[];
} {
  const lines = markdown.split("\n");
  const blocks: string[] = [];
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const open = lines[i].match(/^```(\w*)$/);
    if (open) {
      const lang = open[1];
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      const cls = lang ? ` class="language-${lang}"` : "";
      const html = `<pre><code${cls}>${escapeHtml(codeLines.join("\n"))}</code></pre>`;
      blocks.push(html);
      out.push(`${CODE_BLOCK_PLACEHOLDER}${blocks.length - 1}\uE001`);
      if (i < lines.length) i++;
      continue;
    }
    out.push(lines[i]);
    i++;
  }

  return { markdown: out.join("\n"), blocks };
}

function restoreCodeBlocks(html: string, blocks: string[]): string {
  return html.replace(
    new RegExp(`${CODE_BLOCK_PLACEHOLDER}(\\d+)\uE001`, "g"),
    (_, index) => blocks[Number(index)] ?? ""
  );
}

export function markdownToHtml(markdown: string): string {
  const { markdown: withoutCode, blocks } = extractCodeBlocks(markdown);
  let html = withoutCode;

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");
  html = processTable(html);
  html = processLists(html);
  html = html.replace(/^---+$/gm, "<hr />");
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  html = html
    .split("\n\n")
    .map((block) => wrapBlockAsParagraph(block))
    .join("\n\n");

  return restoreCodeBlocks(html, blocks);
}

const BLOCK_LEVEL_HTML =
  /^<(h[1-6]|table|ul|ol|blockquote|pre|hr|div|p)(\s|>|\/)/i;

function wrapBlockAsParagraph(block: string): string {
  const trimmed = block.trim();
  if (!trimmed) return "";
  if (BLOCK_LEVEL_HTML.test(trimmed)) return trimmed;
  return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function processTable(html: string): string {
  return html.replace(/((?:\|.+\|\n?)+)/g, (match) => {
    const rows = match.trim().split("\n");
    if (rows.length < 2) return match;
    const isAlignRow = /^\|[\s\-:|]+\|$/.test(rows[1]);
    const headerRow = rows[0];
    const bodyRows = isAlignRow ? rows.slice(2) : rows.slice(1);
    const parseRow = (row: string) =>
      row.split("|").slice(1, -1).map((c) => c.trim());
    const headers = parseRow(headerRow).map((h) => `<th>${h}</th>`).join("");
    const body = bodyRows
      .map((row) => `<tr>${parseRow(row).map((c) => `<td>${c}</td>`).join("")}</tr>`)
      .join("\n");
    return `<table>\n<thead><tr>${headers}</tr></thead>\n<tbody>${body}</tbody>\n</table>`;
  });
}

function processLists(html: string): string {
  html = html.replace(/((?:^[-*+]\s+.+\n?)+)/gm, (match) => {
    const items = match.trim().split("\n").filter(Boolean)
      .map((l) => `<li>${l.replace(/^[-*+]\s+/, "")}</li>`).join("\n");
    return `<ul>\n${items}\n</ul>`;
  });
  html = html.replace(/((?:^\d+\.\s+.+\n?)+)/gm, (match) => {
    const items = match.trim().split("\n").filter(Boolean)
      .map((l) => `<li>${l.replace(/^\d+\.\s+/, "")}</li>`).join("\n");
    return `<ol>\n${items}\n</ol>`;
  });
  return html;
}

export function wordCount(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*`_\[\]()>|]/g, "")
    .split(/\s+/).filter(Boolean).length;
}

export function estimateReadTime(markdown: string): number {
  return Math.ceil(wordCount(markdown) / 200);
}
