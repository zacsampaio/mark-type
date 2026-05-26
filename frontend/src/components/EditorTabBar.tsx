"use client";

import { BookOpen, FileText, Github } from "lucide-react";
import { cn } from "@/lib/utils";

export type EditorTab = "paste" | "github" | "orientacoes";

interface EditorTabBarProps {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  className?: string;
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 flex-1 items-center justify-center gap-2 border-b-2 px-3 text-sm font-medium transition-all duration-150 sm:flex-none sm:justify-start sm:px-4",
        active
          ? "border-ink-950 text-ink-950"
          : "border-transparent text-ink-400 hover:border-ink-300 hover:text-ink-700"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export function EditorTabBar({
  activeTab,
  onTabChange,
  className,
}: EditorTabBarProps) {
  return (
    <div className={cn("flex h-11 items-stretch px-1 sm:px-2", className)}>
      <TabButton
        active={activeTab === "paste"}
        onClick={() => onTabChange("paste")}
        icon={<FileText className="h-3.5 w-3.5" />}
        label="Colar Markdown"
      />
      <TabButton
        active={activeTab === "github"}
        onClick={() => onTabChange("github")}
        icon={<Github className="h-3.5 w-3.5" />}
        label="Importar do GitHub"
      />
      <TabButton
        active={activeTab === "orientacoes"}
        onClick={() => onTabChange("orientacoes")}
        icon={<BookOpen className="h-3.5 w-3.5" />}
        label="Orientações"
      />
    </div>
  );
}
