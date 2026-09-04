/*
# Create brief-bilder storage bucket

1. Storage
   - Creates a PRIVATE bucket `brief-bilder` for uploaded images.
   - Anon can upload files to `brief-bilder/{slug}/` paths.
   - No public read — files are only accessible via service role (signed URLs).

2. Security
   - INSERT policy for anon: can upload to any path in the bucket.
   - No SELECT/UPDATE/DELETE for anon — images are private.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('brief-bilder', 'brief-bilder', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_upload_brief_bilder" ON storage.objects;
CREATE POLICY "anon_upload_brief_bilder" ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'brief-bilder');
