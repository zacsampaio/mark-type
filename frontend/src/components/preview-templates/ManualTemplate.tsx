interface ManualTemplateProps {
  html: string;
}

/** Conteúdo integral no Markdown — sem cabeçalho duplicado do frame. */
export function ManualTemplate({ html }: ManualTemplateProps) {
  return (
    <div
      className="doc-preview template-manual"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
