export type TemplateId =
  | "professional"
  | "modern"
  | "saas"
  | "document"
  | "compliance";

export interface DocTemplate {
  id: TemplateId;
  name: string;
  description: string;
  fontFamily: string;
  /** CSS class name applied to the preview container */
  previewClass: string;
  /** PDF page margin in cm */
  margin: string;
  /** Paper size */
  pageSize: "A4" | "Letter";
  styles: {
    coverBg: string;
    coverText: string;
    headingFont: string;
    bodyFont: string;
    accentColor: string;
    codeBackground: string;
    codeColor: string;
  };
}

export const TEMPLATES: Record<TemplateId, DocTemplate> = {
  professional: {
    id: "professional",
    name: "Professional",
    description: "ABNT-inspired serif typography with formal structure",
    fontFamily: "'Playfair Display', Georgia, serif",
    previewClass: "template-professional",
    margin: "2.5cm",
    pageSize: "A4",
    styles: {
      coverBg: "#0f0e0c",
      coverText: "#f5f0e8",
      headingFont: "'Playfair Display', Georgia, serif",
      bodyFont: "'Playfair Display', Georgia, serif",
      accentColor: "#c0651a",
      codeBackground: "#edeae3",
      codeColor: "#9a4f10",
    },
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Clean sans-serif with visual hierarchy and highlight blocks",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    previewClass: "template-modern",
    margin: "2cm",
    pageSize: "A4",
    styles: {
      coverBg: "#0f0e0c",
      coverText: "#f5f0e8",
      headingFont: "'DM Sans', system-ui, sans-serif",
      bodyFont: "'DM Sans', system-ui, sans-serif",
      accentColor: "#2d6a4f",
      codeBackground: "#edeae3",
      codeColor: "#9a4f10",
    },
  },
  saas: {
    id: "saas",
    name: "SaaS",
    description: "Product documentation style",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    previewClass: "template-saas",
    margin: "2cm",
    pageSize: "A4",
    styles: {
      coverBg: "#0f172a",
      coverText: "#f8fafc",
      headingFont: "'Plus Jakarta Sans', system-ui, sans-serif",
      bodyFont: "'Plus Jakarta Sans', system-ui, sans-serif",
      accentColor: "#2563eb",
      codeBackground: "#f1f5f9",
      codeColor: "#1e293b",
    },
  },
  document: {
    id: "document",
    name: "Document",
    description: "Minimal print-friendly",
    fontFamily: "Georgia, 'Times New Roman', serif",
    previewClass: "template-document",
    margin: "2cm",
    pageSize: "A4",
    styles: {
      coverBg: "#ffffff",
      coverText: "#111111",
      headingFont: "Georgia, serif",
      bodyFont: "Georgia, serif",
      accentColor: "#333333",
      codeBackground: "#f3f3f3",
      codeColor: "#111111",
    },
  },
  compliance: {
    id: "compliance",
    name: "Compliance",
    description: "Formal regulatory-oriented layout",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    previewClass: "template-compliance",
    margin: "2.5cm",
    pageSize: "A4",
    styles: {
      coverBg: "#f4f4f4",
      coverText: "#1a1a1a",
      headingFont: "'DM Sans', system-ui, sans-serif",
      bodyFont: "'DM Sans', system-ui, sans-serif",
      accentColor: "#1a1a1a",
      codeBackground: "#fafafa",
      codeColor: "#1a1a1a",
    },
  },
};

export function getTemplate(id: TemplateId): DocTemplate {
  return TEMPLATES[id] ?? TEMPLATES.modern;
}

export function getAllTemplates(): DocTemplate[] {
  return Object.values(TEMPLATES);
}
