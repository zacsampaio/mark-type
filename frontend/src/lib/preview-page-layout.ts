/**
 * Folha A4 e margens alinhadas ao Word (Configurar página → Margens):
 * superior/inferior 2 cm, esquerda/direita 1,69 cm.
 */

export const DOCUMENT_PAGE_MARGINS_MM = {
  top: 20,
  right: 16.9,
  bottom: 20,
  left: 16.9,
} as const;

export const PREVIEW_PAGE = {
  widthMm: 210,
  heightMm: 297,
  marginTopMm: DOCUMENT_PAGE_MARGINS_MM.top,
  marginRightMm: DOCUMENT_PAGE_MARGINS_MM.right,
  marginBottomMm: DOCUMENT_PAGE_MARGINS_MM.bottom,
  marginLeftMm: DOCUMENT_PAGE_MARGINS_MM.left,
} as const;

export const PREVIEW_CONTENT_WIDTH_MM =
  PREVIEW_PAGE.widthMm - PREVIEW_PAGE.marginLeftMm - PREVIEW_PAGE.marginRightMm;

export const PREVIEW_CONTENT_HEIGHT_MM =
  PREVIEW_PAGE.heightMm -
  PREVIEW_PAGE.marginTopMm -
  PREVIEW_PAGE.marginBottomMm;

/** Margens para Puppeteer `page.pdf()` */
export const PDF_PAGE_MARGINS = {
  top: `${DOCUMENT_PAGE_MARGINS_MM.top}mm`,
  right: `${DOCUMENT_PAGE_MARGINS_MM.right}mm`,
  bottom: `${DOCUMENT_PAGE_MARGINS_MM.bottom}mm`,
  left: `${DOCUMENT_PAGE_MARGINS_MM.left}mm`,
} as const;

const TWIPS_PER_CM = 567;

export function cmToDocxTwips(cm: number): number {
  return Math.round(cm * TWIPS_PER_CM);
}

/** Margens para html-to-docx (twips). */
export const DOCX_PAGE_MARGINS = {
  top: cmToDocxTwips(2),
  right: cmToDocxTwips(1.69),
  bottom: cmToDocxTwips(2),
  left: cmToDocxTwips(1.69),
  header: 720,
  footer: 720,
  gutter: 0,
} as const;

const MM_PER_INCH = 25.4;
const CSS_PX_PER_INCH = 96;

/** Converte mm para pixels CSS (96 dpi). */
export function mmToCssPx(mm: number): number {
  return (mm / MM_PER_INCH) * CSS_PX_PER_INCH;
}

export function previewPageSizePx(): { width: number; height: number } {
  return {
    width: mmToCssPx(PREVIEW_PAGE.widthMm),
    height: mmToCssPx(PREVIEW_PAGE.heightMm),
  };
}
