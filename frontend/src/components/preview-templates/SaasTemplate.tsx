interface SaasTemplateProps {
  html: string;
}

export function SaasTemplate({ html }: SaasTemplateProps) {
  return (
    <div
      className="doc-preview template-saas"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
