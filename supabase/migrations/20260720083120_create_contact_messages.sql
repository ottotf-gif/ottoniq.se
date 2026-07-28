/*
# Create contact_messages table (single-tenant, no auth)

1. New Tables
   - `contact_messages`
     - `id` (uuid, primary key)
     - `name` (text, not null) - sender name
     - `email` (text, not null) - sender email
     - `message` (text, not null) - message body
     - `created_at` (timestamptz) - when the message was sent

2. Security
   - Enable RLS on `contact_messages`.
   - Allow anon + authenticated INSERT (visitors submit messages).
   - Allow anon + authenticated SELECT (for confirmation feedback).
   - No UPDATE or DELETE from public.

3. Notes
   - This replaces Formspree. Messages are stored directly in Supabase.
   - No third-party services handle form data.
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_contact_messages" ON contact_messages;
CREATE POLICY "anon_select_contact_messages" ON contact_messages FOR SELECT
  TO anon, authenticated USING (true);
