import { TemplateFrame } from "./TemplateFrame";

interface ComplianceTemplateProps {
  html: string;
  title: string;
  description?: string;
}

export function ComplianceTemplate({
  html,
  title,
  description,
}: ComplianceTemplateProps) {
  return (
    <TemplateFrame
      title={title}
      description={description}
      meta={`Classificacao interna · ${new Date().toLocaleDateString("pt-BR")}`}
      className="doc-preview template-compliance"
      headerClassName="border-neutral-700"
      badgeClassName="bg-neutral-900 text-white rounded-sm uppercase tracking-wider"
      titleClassName="text-neutral-900"
      descriptionClassName="text-neutral-700"
    >
      <div className="mb-4 rounded border border-neutral-400 bg-neutral-100 px-3 py-2 text-xs text-neutral-700">
        Documento para conformidade e auditoria.
      </div>
      <div
        className="doc-preview template-compliance"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </TemplateFrame>
  );
}
