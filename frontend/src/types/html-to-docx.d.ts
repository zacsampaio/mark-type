declare module "html-to-docx" {
  function HTMLtoDOCX(
    html: string,
    headerHTML: string | null,
    documentOptions?: Record<string, unknown>,
    footerHTML?: string | null
  ): Promise<Buffer>;

  export default HTMLtoDOCX;
}
