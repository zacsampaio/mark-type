import type { ParsedDocument, Section } from "./types";

// Lightweight markdown-to-HTML converter (no external deps needed for MVP)
// In production, swap for marked or remark

export function parseMarkdown(input: string): ParsedDocument {
  const lines = input.split("\n");
  let title = "Untitled Document";
  let description = "";
  const sections: Section[] = [];

  // Extract title from first h1
  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      title = h1[1].trim();
      break;
    }
  }

  // Extract blockquote after title as description
  for (const line of lines) {
    const bq = line.match(/^>\s+(.+)/);
    if (bq) {
      description = bq[1].trim();
      break;
    }
  }

  // Parse sections
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

  return {
    title,
    description,
    sections,
    rawHtml: markdownToHtml(input),
  };
}

export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape HTML (basic)
  // Note: intentionally NOT escaping < > for inline HTML passthrough in preview
  // For production, use DOMPurify

  // Code blocks (must come before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/gm, (_, lang, code) => {
    const cls = lang ? ` class="language-${lang}"` : "";
    return `<pre><code${cls}>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headings
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");

  // Tables
  html = processTable(html);

  // Unordered lists
  html = processLists(html);

  // Horizontal rules
  html = html.replace(/^---+$/gm, "<hr />");

  // Links and images
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" />'
  );
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Paragraphs — wrap orphan lines
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<")) return trimmed;
      return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
    })
    .join("\n\n");

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function processTable(html: string): string {
  const tableRegex = /(\|.+\|\n)+/g;
  return html.replace(tableRegex, (match) => {
    const rows = match.trim().split("\n");
    if (rows.length < 2) return match;

    const headerRow = rows[0];
    const isAlignRow = /^\|[\s\-:|]+\|$/.test(rows[1]);
    const bodyRows = isAlignRow ? rows.slice(2) : rows.slice(1);

    const parseRow = (row: string) =>
      row
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());

    const headers = parseRow(headerRow)
      .map((h) => `<th>${h}</th>`)
      .join("");
    const body = bodyRows
      .map((row) => `<tr>${parseRow(row).map((c) => `<td>${c}</td>`).join("")}</tr>`)
      .join("\n");

    return `<table>\n<thead><tr>${headers}</tr></thead>\n<tbody>${body}</tbody>\n</table>`;
  });
}

function processLists(html: string): string {
  // Process unordered lists
  html = html.replace(/((?:^[-*+]\s+.+\n?)+)/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => `<li>${line.replace(/^[-*+]\s+/, "")}</li>`)
      .join("\n");
    return `<ul>\n${items}\n</ul>`;
  });

  // Process ordered lists
  html = html.replace(/((?:^\d+\.\s+.+\n?)+)/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => `<li>${line.replace(/^\d+\.\s+/, "")}</li>`)
      .join("\n");
    return `<ol>\n${items}\n</ol>`;
  });

  return html;
}

export function wordCount(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*`_\[\]()>|]/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function estimateReadTime(markdown: string): number {
  return Math.ceil(wordCount(markdown) / 200);
}
