/*
# Create kunder and brief tables for demo request flow

1. New Tables
   - `kunder` — customer records, each with a unique slug
     - `id` (uuid, primary key)
     - `slug` (text, unique) — e.g. "tjorns-marin-motor"
     - `foretag` (text) — company name
     - `kontakt_namn` (text) — contact person name
     - `kontakt_mejl` (text) — contact person email
     - `skapad` (timestamptz, default now())

   - `brief` — project brief submitted by customer
     - `id` (uuid, primary key)
     - `kund_id` (uuid, FK to kunder)
     - `foretag_fritext` (text, nullable) — freeform company name
     - `mal` (text) — what visitors should do
     - `tjanster` (text) — top 3 services
     - `omraden` (text) — service areas
     - `vanligaste_fragan` (text) — most common customer question
     - `referens_lank` (text, nullable) — reference link
     - `ovrigt` (text, nullable) — anything else
     - `bilder` (jsonb) — array of uploaded filenames
     - `skickad` (timestamptz, default now())

2. Security
   - RLS enabled on both tables.
   - `kunder`: anon can SELECT (to look up slug for uploads). No insert/update/delete for anon.
   - `brief`: anon can INSERT (to submit the form). No select/update/delete for anon — protects other people's answers.

3. Notes
   - No auth required. Form is public, submissions are anonymous.
   - Brief data is only readable by service role (admin).
*/

-- kunder table
CREATE TABLE IF NOT EXISTS kunder (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  foretag text NOT NULL,
  kontakt_namn text NOT NULL,
  kontakt_mejl text NOT NULL,
  skapad timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE kunder ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_kunder" ON kunder;
CREATE POLICY "anon_select_kunder" ON kunder FOR SELECT
  TO anon, authenticated USING (true);

-- brief table
CREATE TABLE IF NOT EXISTS brief (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kund_id uuid NOT NULL REFERENCES kunder(id) ON DELETE CASCADE,
  foretag_fritext text,
  mal text NOT NULL,
  tjanster text NOT NULL,
  omraden text NOT NULL,
  vanligaste_fragan text NOT NULL,
  referens_lank text,
  ovrigt text,
  bilder jsonb NOT NULL DEFAULT '[]'::jsonb,
  skickad timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE brief ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_brief" ON brief;
CREATE POLICY "anon_insert_brief" ON brief FOR INSERT
  TO anon, authenticated WITH CHECK (true);
