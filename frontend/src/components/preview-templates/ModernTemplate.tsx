interface ModernTemplateProps {
  html: string;
}

export function ModernTemplate({ html }: ModernTemplateProps) {
  return (
    <div
      className="doc-preview template-modern"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
