-- =============================================================================
-- MarkType — Bucket público `pdfs` + leitura pública dos ficheiros
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdfs',
  'pdfs',
  true,
  52428800,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read pdfs bucket" ON storage.objects;
CREATE POLICY "Public read pdfs bucket"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'pdfs');
