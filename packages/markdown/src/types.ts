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
