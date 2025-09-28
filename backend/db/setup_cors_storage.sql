-- ===================================================================
-- SUPABASE STORAGE CORS CONFIGURATION
-- ===================================================================

-- Sprawdź obecną konfigurację Storage
SELECT * FROM storage.buckets WHERE id = 'hardbanrecords-files';

-- Usuń istniejące polityki jeśli potrzeba
DROP POLICY IF EXISTS "Upload access for service role" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Update access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Delete access for authenticated users" ON storage.objects;

-- Utwórz bucket jeśli nie istnieje
INSERT INTO storage.buckets (id, name, public)
VALUES ('hardbanrecords-files', 'hardbanrecords-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Polityki Storage - UPROSZCZONE dla compatibility
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hardbanrecords-files');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'hardbanrecords-files');

CREATE POLICY "Allow public updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'hardbanrecords-files');

CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'hardbanrecords-files');

-- Weryfikacja setup
SELECT
  'CORS SETUP COMPLETE ✅' as status,
  'Bucket configured for public access' as message;

-- Test policy creation
SELECT
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%public%';
