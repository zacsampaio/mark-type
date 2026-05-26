interface ComplianceTemplateProps {
  html: string;
}

export function ComplianceTemplate({ html }: ComplianceTemplateProps) {
  return (
    <>
      <div
        data-preview-banner
        className="mb-4 rounded border border-neutral-400 bg-neutral-100 px-3 py-2 text-xs text-neutral-700"
      >
        Documento para conformidade e auditoria.
      </div>
      <div
        className="doc-preview template-compliance"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
