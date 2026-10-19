// Supabase-anslutning för frontend.
//
// Dessa värden är PUBLIKA: anon-nyckeln är designad för att ligga i webbläsaren
// och skyddas av Row Level Security (RLS) i databasen. Därför är det säkert att
// ha dem i koden som standardvärden. Den hemliga service_role-nyckeln används
// bara server-side i edge functions och finns aldrig här.
//
// Sätt VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY som miljövariabler för att
// peka mot ett annat projekt — annars används standardvärdena nedan.
// I produktion går anropen via same-origin-proxyn /sb (se worker.js) för att
// undvika cross-origin-problem. I utveckling (localhost) anropas Supabase direkt.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env.PROD ? '/sb' : 'https://nxnitpsmynfttyoczilk.supabase.co');

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bml0cHNteW5mdHR5b2N6aWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNzE4MTUsImV4cCI6MjEwMzg0NzgxNX0.Dq8bTbnSlozOm8RgqimwbOA4Eqzl6pG5Ax0rCk64pw0';
