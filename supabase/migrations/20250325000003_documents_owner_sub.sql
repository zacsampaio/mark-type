-- =============================================================================
-- MarkType — Vincular documentos ao utilizador da sessão (NextAuth)
-- =============================================================================

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS owner_sub TEXT;

COMMENT ON COLUMN public.documents.owner_sub IS
  'Identificador estável da sessão NextAuth (token.sub): Supabase user UUID ou GitHub user id.';

CREATE INDEX IF NOT EXISTS documents_owner_sub_idx ON public.documents(owner_sub);
