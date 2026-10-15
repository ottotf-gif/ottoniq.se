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