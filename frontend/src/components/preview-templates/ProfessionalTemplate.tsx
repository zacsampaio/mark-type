interface ProfessionalTemplateProps {
  html: string;
}

export function ProfessionalTemplate({ html }: ProfessionalTemplateProps) {
  return (
    <div
      className="doc-preview template-professional"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
