interface DocumentTemplateProps {
  html: string;
}

export function DocumentTemplate({ html }: DocumentTemplateProps) {
  return (
    <div
      className="doc-preview template-document"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
