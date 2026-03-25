export const PENDING_IMPORT_STORAGE_KEY = "doccraft-pending-import";

export type PendingImportPayload = {
  markdown: string;
  repoName: string;
};
