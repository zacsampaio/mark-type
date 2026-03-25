import type { Template } from "./templates";

export type { Template } from "./templates";

export interface ParsedDocument {
  title: string;
  description?: string;
  sections: Section[];
  rawHtml: string;
}

export interface Section {
  id: string;
  heading: string;
  level: number;
  content: string;
}

export interface GeneratePdfRequest {
  markdown: string;
  template: Template;
}

export interface GeneratePdfResponse {
  url?: string;
  note?: string;
  error?: string;
}

export interface ImportGithubRequest {
  repoUrl: string;
}

export interface ImportGithubResponse {
  markdown?: string;
  repoName?: string;
  error?: string;
}
