export type DocumentCustomization = {
  fontFamily: string;
  bodyColor: string;
  tableHeaderBackground: string;
  tableHeaderColor: string;
  tableRowAltBackground: string;
  tableBorderColor: string;
};

export const DEFAULT_DOCUMENT_CUSTOMIZATION: DocumentCustomization = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  bodyColor: "#111111",
  tableHeaderBackground: "#333333",
  tableHeaderColor: "#ffffff",
  tableRowAltBackground: "#f5f5f5",
  tableBorderColor: "#cccccc",
};

export function mergeCustomization(
  partial?: Partial<DocumentCustomization> | null
): DocumentCustomization {
  return { ...DEFAULT_DOCUMENT_CUSTOMIZATION, ...partial };
}

/** CSS injetado após o template (PDF/DOCX). */
export function buildCustomizationOverrideCss(
  customization?: Partial<DocumentCustomization> | null
): string {
  const c = mergeCustomization(customization);
  return `
  body {
    font-family: ${c.fontFamily} !important;
    color: ${c.bodyColor} !important;
  }
  h1, h2, h3, h4, h5, h6, p, li, blockquote {
    color: inherit;
  }
  th {
    background: ${c.tableHeaderBackground} !important;
    color: ${c.tableHeaderColor} !important;
  }
  td {
    border-color: ${c.tableBorderColor} !important;
  }
  tr:nth-child(even) td {
    background: ${c.tableRowAltBackground} !important;
  }
`;
}

/** Variáveis CSS para pré-visualização no browser. */
export function customizationToCssVars(
  customization: DocumentCustomization
): Record<string, string> {
  return {
    "--doc-font-family": customization.fontFamily,
    "--doc-body-color": customization.bodyColor,
    "--doc-th-bg": customization.tableHeaderBackground,
    "--doc-th-color": customization.tableHeaderColor,
    "--doc-row-alt": customization.tableRowAltBackground,
    "--doc-table-border": customization.tableBorderColor,
  };
}
