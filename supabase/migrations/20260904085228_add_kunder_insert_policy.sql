/*
# Add INSERT policy for kunder (anon can create customers)

1. Security Changes
   - Previously: kunder had only SELECT policy for anon. The demo form
     needs to create a customer record, but anon couldn't INSERT.
   - Now: anon can INSERT into kunder. This is safe because:
     - The form is public (no auth).
     - Only the edge function reads brief data (service role).
     - anon still cannot UPDATE or DELETE kunder.

2. Notes
   - This fixes the "kan inte skapa kund" error in the demo form.
*/

DROP POLICY IF EXISTS "anon_insert_kunder" ON kunder;
CREATE POLICY "anon_insert_kunder" ON kunder FOR INSERT
  TO anon, authenticated WITH CHECK (true);
