import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BROWSERLESS_TOKEN = Deno.env.get("BROWSERLESS_TOKEN") || "";
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY") || "";
const SERPAI_KEY = Deno.env.get("SERPAI_KEY") || "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o";

const RATE_LIMIT = 5;
const CACHE_TTL_HOURS = 24;

// ---------- helpers ----------

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  return url.replace(/\/+$/, "");
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "0.0.0.0";
}

async function updateScan(id: string, fields: Record<string, unknown>) {
  await supabase.from("scans").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", id);
}

// ---------- step 1: Browserless screenshots + rendered HTML ----------

interface BrowserlessResult {
  mobileScreenshot: string | null;
  desktopScreenshot: string | null;
  renderedHtml: string | null;
}

async function runBrowserless(url: string): Promise<BrowserlessResult> {
  if (!BROWSERLESS_TOKEN) {
    return { mobileScreenshot: null, desktopScreenshot: null, renderedHtml: null };
  }

  const baseUrl = `https://production-sfo.browserless.com`;
  const results: BrowserlessResult = { mobileScreenshot: null, desktopScreenshot: null, renderedHtml: null };

  // Mobile screenshot
  try {
    const mobileRes = await fetch(`${baseUrl}/screenshot?token=${BROWSERLESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        options: { type: "jpeg", quality: 75, fullPage: false },
        viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
        waitFor: 2500,
        gotoOptions: { waitUntil: "networkidle0", timeout: 30000 },
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (mobileRes.ok) {
      const buf = await mobileRes.arrayBuffer();
      results.mobileScreenshot = `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(buf)))}`;
    }
  } catch { /* skip */ }

  // Desktop screenshot
  try {
    const desktopRes = await fetch(`${baseUrl}/screenshot?token=${BROWSERLESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        options: { type: "jpeg", quality: 75, fullPage: false },
        viewport: { width: 1440, height: 900 },
        waitFor: 2500,
        gotoOptions: { waitUntil: "networkidle0", timeout: 30000 },
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (desktopRes.ok) {
      const buf = await desktopRes.arrayBuffer();
      results.desktopScreenshot = `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(buf)))}`;
    }
  } catch { /* skip */ }

  // Rendered HTML content (scrape endpoint)
  try {
    const scrapeRes = await fetch(`${baseUrl}/content?token=${BROWSERLESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        gotoOptions: { waitUntil: "networkidle0", timeout: 30000 },
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (scrapeRes.ok) {
      const scrapeData = await scrapeRes.json();
      results.renderedHtml = scrapeData?.content || scrapeData?.html || null;
    }
  } catch { /* skip */ }

  return results;
}

// ---------- step 2: Google PageSpeed Insights ----------

interface PageSpeedData {
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  tbt: number | null;
}

async function runPageSpeed(url: string): Promise<PageSpeedData> {
  if (!GOOGLE_API_KEY) {
    return { performance: null, accessibility: null, bestPractices: null, seo: null, fcp: null, lcp: null, cls: null, tbt: null };
  }

  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo&key=${GOOGLE_API_KEY}`;
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) return { performance: null, accessibility: null, bestPractices: null, seo: null, fcp: null, lcp: null, cls: null, tbt: null };
    const data = await res.json();
    const lr = data.lighthouseResult;
    if (!lr) return { performance: null, accessibility: null, bestPractices: null, seo: null, fcp: null, lcp: null, cls: null, tbt: null };

    const cats = lr.categories || {};
    const audits = lr.audits || {};
    const metrics = audits["metrics"]?.details?.items?.[0] || {};

    const getScore = (cat: unknown): number | null => {
      const s = (cat as { score?: number | null })?.score;
      return s != null ? Math.round(s * 100) : null;
    };

    return {
      performance: getScore(cats.performance),
      accessibility: getScore(cats.accessibility),
      bestPractices: getScore(cats["best-practices"]),
      seo: getScore(cats.seo),
      fcp: metrics.firstContentfulPaint ?? null,
      lcp: metrics.largestContentfulPaint ?? null,
      cls: metrics.cumulativeLayoutShift ?? null,
      tbt: metrics.totalBlockingTime ?? null,
    };
  } catch {
    return { performance: null, accessibility: null, bestPractices: null, seo: null, fcp: null, lcp: null, cls: null, tbt: null };
  }
}

// ---------- step 3: Google visibility (Places + SerpApi) ----------

interface GoogleVisibility {
  hasPlace: boolean;
  placeRating: number | null;
  placeReviewCount: number | null;
  placeTypes: string[];
  foundInSearch: boolean;
  searchPosition: number | null;
  searchResults: { title: string; link: string; snippet: string }[];
}

async function runGoogleVisibility(
  companyName: string | null,
  ort: string | null,
  hostname: string
): Promise<GoogleVisibility> {
  const result: GoogleVisibility = {
    hasPlace: false,
    placeRating: null,
    placeReviewCount: null,
    placeTypes: [],
    foundInSearch: false,
    searchPosition: null,
    searchResults: [],
  };

  const searchText = [companyName, ort].filter(Boolean).join(" ");

  // Google Places API (New) — text search
  if (GOOGLE_API_KEY && searchText) {
    try {
      const placesRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask": "places.displayName,places.rating,places.userRatingCount,places.types",
        },
        body: JSON.stringify({ textQuery: searchText, languageCode: "sv" }),
        signal: AbortSignal.timeout(15000),
      });
      if (placesRes.ok) {
        const placesData = await placesRes.json();
        const place = placesData?.places?.[0];
        if (place) {
          result.hasPlace = true;
          result.placeRating = place.rating ?? null;
          result.placeReviewCount = place.userRatingCount ?? null;
          result.placeTypes = (place.types || []).slice(0, 5);
        }
      }
    } catch { /* skip */ }
  }

  // SerpApi — check Google search ranking
  if (SERPAI_KEY) {
    const queries = [
      searchText || hostname,
      `${companyName || hostname} ${ort || ""}`.trim(),
      `${companyName || hostname} hemsida`.trim(),
    ];

    for (const q of queries) {
      if (!q) continue;
      try {
        const serpRes = await fetch(
          `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&num=10&api_key=${SERPAI_KEY}`,
          { signal: AbortSignal.timeout(15000) }
        );
        if (serpRes.ok) {
          const serpData = await serpRes.json();
          const organic = serpData?.organic_results || [];
          for (let i = 0; i < organic.length; i++) {
            const link = organic[i].link || "";
            if (link.includes(hostname) || link.includes(getHostname(hostname))) {
              result.foundInSearch = true;
              if (result.searchPosition === null) result.searchPosition = i + 1;
            }
          }
          if (result.searchResults.length === 0) {
            result.searchResults = organic.slice(0, 5).map((r: { title?: string; link?: string; snippet?: string }) => ({
              title: r.title || "",
              link: r.link || "",
              snippet: r.snippet || "",
            }));
          }
          if (result.foundInSearch) break;
        }
      } catch { /* skip */ }
    }
  }

  return result;
}

// ---------- step 4: OpenAI vision assessment ----------

interface AIAssessment {
  areas: {
    id: string;
    title: string;
    status: "bra" | "kan_forbattras";
    summary: string;
  }[];
  improvements: {
    id: string;
    title: string;
    description: string;
    priority: "hojt" | "medel" | "lagt";
    area: string;
  }[];
  overallSummary: string;
}

async function runAIAssessment(
  mobileScreenshot: string | null,
  desktopScreenshot: string | null,
  renderedHtml: string | null,
  pageSpeed: PageSpeedData,
  googleVisibility: GoogleVisibility,
  url: string,
  companyName: string | null,
  ort: string | null
): Promise<AIAssessment | null> {
  if (!OPENAI_API_KEY) return null;

  const textContext = {
    url,
    companyName,
    ort,
    pageSpeed: {
      performance: pageSpeed.performance,
      accessibility: pageSpeed.accessibility,
      seo: pageSpeed.seo,
      bestPractices: pageSpeed.bestPractices,
      fcp: pageSpeed.fcp,
      lcp: pageSpeed.lcp,
      cls: pageSpeed.cls,
      tbt: pageSpeed.tbt,
    },
    googleVisibility: {
      hasPlace: googleVisibility.hasPlace,
      placeRating: googleVisibility.placeRating,
      placeReviewCount: googleVisibility.placeReviewCount,
      foundInSearch: googleVisibility.foundInSearch,
      searchPosition: googleVisibility.searchPosition,
    },
    renderedHtmlSnippet: renderedHtml ? renderedHtml.slice(0, 8000) : null,
  };

  const messages: Array<
    | { role: "system" | "user"; content: string }
    | { role: "user"; content: Array<{ type: string; text?: string; image_url?: { url: string } }> }
  > = [
    {
      role: "system",
      content: `Du är en svensk webbkonsult som gör en ärlig, positiv och konkret bedömning av en företagshemsida.
Du får skärmbilder, renderad HTML, data från Google PageSpeed Insights och information om företagets synbarhet på Google.

Returnera ENDAST giltlig JSON enligt detta schema (inga poäng, inga siffror som betyg):

{
  "areas": [
    { "id": "first_impression", "title": "Första intrycket", "status": "bra" | "kan_forbattras", "summary": "1-2 meningar" },
    { "id": "mobile", "title": "Mobilupplevelsen", "status": "bra" | "kan_forbattras", "summary": "1-2 meningar" },
    { "id": "google_visibility", "title": "Synbarhet på Google", "status": "bra" | "kan_forbattras", "summary": "1-2 meningar" },
    { "id": "content", "title": "Innehåll och budskap", "status": "bra" | "kan_forbattras", "summary": "1-2 meningar" },
    { "id": "performance", "title": "Laddtid och teknik", "status": "bra" | "kan_forbattras", "summary": "1-2 meningar" }
  ],
  "improvements": [
    { "id": "unikt-id", "title": "Kort rubrik", "description": "Konkret förklaring på 1-2 meningar", "priority": "hojt" | "medel" | "lagt", "area": "first_impression|mobile|google_visibility|content|performance" }
  ],
  "overallSummary": "2-3 meningar som sammanfattar helheten — positiv ton men ärlig"
}

Regler:
- Skriv ALLTID på svenska.
- Var positiv men ärlig. Om något är dåligt, säg det men fokusera på hur det kan bli bättre.
- Ge 3-6 konkreta förbättringsförslag.
- Använd ALDRIG poäng, procent eller siffror som betyg.
- Använd aldrig ordet "dålig" — skriv "kan förbättras" eller liknande.
- Titta noga på skärmbilderna: syns företagets namn? Är layouten mobilanpassad? Ser det proffsigt ut?
- Om du inte har skärmbilder, basera bedömningen på HTML och PageSpeed-data.`,
    },
  ];

  const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    { type: "text", text: `Kontext (JSON):\n${JSON.stringify(textContext, null, 2)}` },
  ];

  if (mobileScreenshot) {
    userContent.push({ type: "image_url", image_url: { url: mobileScreenshot } });
  }
  if (desktopScreenshot) {
    userContent.push({ type: "image_url", image_url: { url: desktopScreenshot } });
  }

  messages.push({ role: "user", content: userContent });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        max_tokens: 2500,
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(90000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    if (!parsed.areas || !parsed.improvements) return null;
    return parsed as AIAssessment;
  } catch {
    return null;
  }
}

// ---------- full scan pipeline ----------

async function executeScan(scanId: string, url: string, companyName: string | null, ort: string | null) {
  try {
    await updateScan(scanId, { status: "running", step: 1 });

    // Step 1: Browserless
    const browserless = await runBrowserless(url);
    await updateScan(scanId, { step: 2 });

    // Step 2: PageSpeed
    const pageSpeed = await runPageSpeed(url);
    await updateScan(scanId, { step: 3 });

    // Step 3: Google visibility
    const hostname = getHostname(url);
    const googleVisibility = await runGoogleVisibility(companyName, ort, hostname);
    await updateScan(scanId, { step: 4 });

    // Step 4: AI assessment
    const aiAssessment = await runAIAssessment(
      browserless.mobileScreenshot,
      browserless.desktopScreenshot,
      browserless.renderedHtml,
      pageSpeed,
      googleVisibility,
      url,
      companyName,
      ort
    );

    // Build final result
    const result = {
      url,
      hostname,
      companyName,
      ort,
      screenshots: {
        mobile: browserless.mobileScreenshot,
        desktop: browserless.desktopScreenshot,
      },
      pageSpeed,
      googleVisibility,
      assessment: aiAssessment,
      scannedAt: new Date().toISOString(),
    };

    await updateScan(scanId, { status: "completed", step: 4, result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Okänt fel uppstod";
    await updateScan(scanId, { status: "failed", error: msg });
  }
}

// ---------- main handler ----------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const method = req.method;

    // GET /scan-website?id=xxx — poll scan status
    if (method === "GET") {
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "id krävs" }, 400);

      const { data, error } = await supabase
        .from("scans")
        .select("id, status, step, result, error, url, company_name, ort")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) return json({ error: "Hittade inte scannen" }, 404);
      return json(data);
    }

    // POST — create new scan
    if (method === "POST") {
      const body = await req.json().catch(() => ({}));
      const rawUrl = (body.url || "").toString().trim();
      const companyName = (body.companyName || "").toString().trim() || null;
      const ort = (body.ort || "").toString().trim() || null;

      if (!rawUrl) return json({ error: "URL krävs" }, 400);

      const normalized = normalizeUrl(rawUrl);
      const hostname = getHostname(normalized);

      // Rate limiting
      const ip = getClientIp(req);
      const ipHash = await sha256(ip);
      const today = new Date().toISOString().slice(0, 10);

      const { data: rlData } = await supabase
        .from("scan_rate_limits")
        .select("id, count")
        .eq("ip_hash", ipHash)
        .eq("scan_date", today)
        .maybeSingle();

      if (rlData && rlData.count >= RATE_LIMIT) {
        return json({ error: "Du har gjort för många koller idag. Försök igen imorgon." }, 429);
      }

      // Caching: check for recent completed scan of same hostname
      const cacheCutoff = new Date(Date.now() - CACHE_TTL_HOURS * 3600_000).toISOString();
      const { data: cached } = await supabase
        .from("scans")
        .select("id, status, step, result, error, url, company_name, ort")
        .eq("ip_hash", ipHash)
        .ilike("url", `%${hostname}%`)
        .gte("created_at", cacheCutoff)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cached && cached.status === "completed" && cached.result) {
        return json(cached);
      }

      // Create scan row
      const { data: scanRow, error: insertErr } = await supabase
        .from("scans")
        .insert({
          url: normalized,
          company_name: companyName,
          ort,
          ip_hash: ipHash,
          status: "pending",
          step: 0,
        })
        .select("id")
        .single();

      if (insertErr || !scanRow) {
        return json({ error: "Kunde inte skapa scannen" }, 500);
      }

      // Update rate limit counter
      if (rlData) {
        await supabase.from("scan_rate_limits").update({ count: rlData.count + 1 }).eq("id", rlData.id);
      } else {
        await supabase.from("scan_rate_limits").insert({ ip_hash: ipHash, scan_date: today, count: 1 });
      }

      const scanId = scanRow.id;

      // Run scan asynchronously — return immediately with the id
      EdgeRuntime.waitUntil(executeScan(scanId, normalized, companyName, ort));

      return json({ id: scanId, status: "pending", step: 0 });
    }

    return json({ error: "Metod inte tillåten" }, 405);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Serverfel" }, 500);
  }
});
