export const PENDING_IMPORT_STORAGE_KEY = "marktype-pending-import";

export type PendingImportPayload = {
  markdown: string;
  repoName: string;
};
