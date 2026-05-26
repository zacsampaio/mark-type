"use client";

import type { DocumentCustomization } from "@/lib/document-customization";
import type { ExportFormat } from "@/lib/document-customization";
import type { Template } from "@/lib/types";
import { EditorTabBar, type EditorTab } from "@/components/EditorTabBar";
import { PreviewToolbarControls } from "@/components/PreviewToolbar";

interface WorkspaceActionRowProps {
  editorTab: EditorTab;
  onEditorTabChange: (tab: EditorTab) => void;
  template: Template;
  onTemplateChange: (t: Template) => void;
  customization: DocumentCustomization;
  onCustomizationChange: (c: DocumentCustomization) => void;
  onExport: (format: ExportFormat) => void;
  exporting: boolean;
}

/** Linha única (desktop): abas do editor | controles da pré-visualização */
export function WorkspaceActionRow({
  editorTab,
  onEditorTabChange,
  template,
  onTemplateChange,
  customization,
  onCustomizationChange,
  onExport,
  exporting,
}: WorkspaceActionRowProps) {
  return (
    <div className="hidden shrink-0 border-b border-ink-200/90 lg:grid lg:grid-cols-2 lg:divide-x lg:divide-ink-200/80">
      <EditorTabBar
        activeTab={editorTab}
        onTabChange={onEditorTabChange}
        className="bg-parchment-50/90"
      />
      <PreviewToolbarControls
        template={template}
        onTemplateChange={onTemplateChange}
        customization={customization}
        onCustomizationChange={onCustomizationChange}
        onExport={onExport}
        exporting={exporting}
        selectId="preview-template-select-desktop"
      />
    </div>
  );
}
