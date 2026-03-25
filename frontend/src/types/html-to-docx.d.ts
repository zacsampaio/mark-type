declare module "html-to-docx" {
  type DocumentOptions = Record<string, unknown>;

  function HTMLtoDOCX(
    htmlString: string,
    headerHTMLString: string | null,
    documentOptions?: DocumentOptions,
    footerHTMLString?: string | null
  ): Promise<Buffer | Blob | ArrayBuffer>;

  export default HTMLtoDOCX;
}
