/*
# Create scans and scan_rate_limits tables

## Purpose
Supports the rebuilt /scan tool. The frontend creates a scan request, receives an id,
and polls for results while the edge function runs the analysis asynchronously.

## New Tables

### scans
- id (uuid, primary key) — public identifier used in /scan/:id URLs
- url (text, not null) — the website URL being scanned
- company_name (text, nullable) — optional business name for Google visibility check
- ort (text, nullable) — optional location for Google visibility check
- ip_hash (text, not null) — SHA-256 hash of caller IP for rate limiting
- status (text, not null, default 'pending') — pending | running | completed | failed
- step (int, not null, default 0) — current step 0-4 for progress UI
- result (jsonb, nullable) — full scan result object when completed
- error (text, nullable) — error message if failed
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

### scan_rate_limits
- id (uuid, primary key)
- ip_hash (text, not null) — SHA-256 hash of caller IP
- scan_date (date, not null) — the day this counter applies to
- count (int, not null, default 1) — number of scans started this day
- created_at (timestamptz, default now())
- Unique constraint on (ip_hash, scan_date) so each IP gets one row per day

## Security
- RLS enabled on both tables.
- scans: anon can SELECT (to view results via /scan/:id) and INSERT (to create scans).
  UPDATE/DELETE restricted to service role only (edge function uses service role key).
- scan_rate_limits: no anon access needed — managed entirely by the edge function
  with the service role key. RLS enabled with no policies = anon cannot read or modify.
- This is a no-auth public tool, so SELECT/INSERT use TO anon, authenticated.

## Notes
1. The edge function uses SUPABASE_SERVICE_ROLE_KEY to update scan status and
   manage rate limits, bypassing RLS.
2. Screenshots are stored as base64 data URLs inside the result jsonb — no storage
   bucket needed.
3. ip_hash is a SHA-256 digest (not the raw IP) for privacy.
*/

CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  company_name text,
  ort text,
  ip_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  step int NOT NULL DEFAULT 0,
  result jsonb,
  error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scan_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  scan_date date NOT NULL,
  count int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE (ip_hash, scan_date)
);

CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_ip_hash ON scans(ip_hash);
CREATE INDEX IF NOT EXISTS idx_scan_rate_limits_lookup ON scan_rate_limits(ip_hash, scan_date);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_rate_limits ENABLE ROW LEVEL SECURITY;

-- scans: anon can SELECT (view results) and INSERT (create scans)
DROP POLICY IF EXISTS "anon_select_scans" ON scans;
CREATE POLICY "anon_select_scans"
  ON scans FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "anon_insert_scans" ON scans;
CREATE POLICY "anon_insert_scans"
  ON scans FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- scan_rate_limits: no anon policies — only service role manages these