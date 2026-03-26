-- =============================================================================
-- MarkType — INSERT no bucket «pdfs» com chave service_role (API Next.js)
-- O upload do servidor usa SUPABASE_SERVICE_ROLE_KEY; em alguns projetos o
-- Storage exige política explícita de INSERT.
-- =============================================================================

DROP POLICY IF EXISTS "Service role insert pdfs bucket" ON storage.objects;
CREATE POLICY "Service role insert pdfs bucket"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'pdfs'
    AND coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  );
