import type { DocumentCustomization } from "@marktype/document-styles";
import {
  DEFAULT_DOCUMENT_CUSTOMIZATION,
  mergeCustomization,
} from "@marktype/document-styles";

export type { DocumentCustomization };
export { DEFAULT_DOCUMENT_CUSTOMIZATION, mergeCustomization };

export const FONT_FAMILY_OPTIONS = [
  {
    id: "serif",
    label: "Serif (Georgia)",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  {
    id: "sans",
    label: "Sans-serif (DM Sans)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  {
    id: "jakarta",
    label: "Sans-serif (Plus Jakarta)",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  {
    id: "playfair",
    label: "Serif (Playfair)",
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  {
    id: "mono",
    label: "Monoespaçada",
    fontFamily: "'JetBrains Mono', Consolas, monospace",
  },
] as const;

export type ExportFormat = "pdf" | "docx";

export const EXPORT_FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX (Word editável)" },
];

export function findFontOptionByFamily(fontFamily: string) {
  return FONT_FAMILY_OPTIONS.find((o) => o.fontFamily === fontFamily);
}
