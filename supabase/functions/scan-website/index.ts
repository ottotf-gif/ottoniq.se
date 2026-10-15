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
const SERPAPI_KEY = Deno.env.get("SERPAI_KEY") || Deno.env.get("SERPAPI_KEY") || "";
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

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

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
        options: { type: "jpeg", quality: 70, fullPage: false },
        viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
        waitFor: 2500,
        gotoOptions: { waitUntil: "networkidle0", timeout: 30000 },
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (mobileRes.ok) {
      const buf = await mobileRes.arrayBuffer();
      results.mobileScreenshot = `data:image/jpeg;base64,${arrayBufferToBase64(buf)}`;
    }
  } catch { /* skip */ }

  // Desktop screenshot
  try {
    const desktopRes = await fetch(`${baseUrl}/screenshot?token=${BROWSERLESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        options: { type: "jpeg", quality: 70, fullPage: false },
        viewport: { width: 1440, height: 900 },
        waitFor: 2500,
        gotoOptions: { waitUntil: "networkidle0", timeout: 30000 },
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (desktopRes.ok) {
      const buf = await desktopRes.arrayBuffer();
      results.desktopScreenshot = `data:image/jpeg;base64,${arrayBufferToBase64(buf)}`;
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

const emptyPageSpeed: PageSpeedData = {
  performance: null, accessibility: null, bestPractices: null, seo: null,
  fcp: null, lcp: null, cls: null, tbt: null,
};

async function runPageSpeed(url: string): Promise<PageSpeedData> {
  try {
    // Works with or without API key (lower quota without key)
    const keyParam = GOOGLE_API_KEY ? `&key=${GOOGLE_API_KEY}` : "";
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo${keyParam}`;
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) return emptyPageSpeed;
    const data = await res.json();
    const lr = data.lighthouseResult;
    if (!lr) return emptyPageSpeed;

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
    return emptyPageSpeed;
  }
}

// ---------- step 3: Google visibility via SerpApi ----------

interface GoogleProfile {
  google_profil_hittad: boolean;
  knowledge_graph: {
    exists: boolean;
    title: string | null;
    rating: number | null;
    review_count: number | null;
    has_hours: boolean;
    website_matches: boolean;
  };
  local_results: {
    exists: boolean;
    rating: number | null;
    reviews: number | null;
    position: number | null;
  };
  found_in_search: boolean;
  search_position: number | null;
  search_results: { title: string; link: string; snippet: string }[];
}

async function runSerpApiSearch(
  query: string,
  hostname: string
): Promise<{
  serpData: Record<string, unknown> | null;
  foundInSearch: boolean;
  searchPosition: number | null;
  searchResults: { title: string; link: string; snippet: string }[];
}> {
  try {
    const serpRes = await fetch(
      `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&num=10&api_key=${SERPAPI_KEY}`,
      { signal: AbortSignal.timeout(15000) }
    );
    if (!serpRes.ok) return { serpData: null, foundInSearch: false, searchPosition: null, searchResults: [] };

    const serpData = await serpRes.json();
    const organic = (serpData?.organic_results || []) as Array<{ title?: string; link?: string; snippet?: string }>;

    let foundInSearch = false;
    let searchPosition: number | null = null;

    for (let i = 0; i < organic.length; i++) {
      const link = organic[i].link || "";
      if (link.includes(hostname)) {
        foundInSearch = true;
        if (searchPosition === null) searchPosition = i + 1;
      }
    }

    const searchResults = organic.slice(0, 5).map((r) => ({
      title: r.title || "",
      link: r.link || "",
      snippet: r.snippet || "",
    }));

    return { serpData, foundInSearch, searchPosition, searchResults };
  } catch {
    return { serpData: null, foundInSearch: false, searchPosition: null, searchResults: [] };
  }
}

async function runGoogleVisibility(
  companyName: string | null,
  ort: string | null,
  hostname: string
): Promise<GoogleProfile> {
  const result: GoogleProfile = {
    google_profil_hittad: false,
    knowledge_graph: {
      exists: false,
      title: null,
      rating: null,
      review_count: null,
      has_hours: false,
      website_matches: false,
    },
    local_results: {
      exists: false,
      rating: null,
      reviews: null,
      position: null,
    },
    found_in_search: false,
    search_position: null,
    search_results: [],
  };

  if (!SERPAPI_KEY) return result;

  // Two searches: "companyName + ort" and "companyName" (without ort)
  // The second search may surface the knowledge graph panel differently
  const query1 = [companyName, ort].filter(Boolean).join(" ").trim();
  const query2 = companyName || hostname;

  const seen = new Set<string>();
  const queries = [query1, query2].filter((q) => {
    if (q.length === 0 || seen.has(q)) return false;
    seen.add(q);
    return true;
  });

  for (let qi = 0; qi < queries.length; qi++) {
    const { serpData, foundInSearch, searchPosition, searchResults } = await runSerpApiSearch(queries[qi], hostname);

    if (foundInSearch && !result.found_in_search) {
      result.found_in_search = true;
      result.search_position = searchPosition;
    }
    if (result.search_results.length === 0 && searchResults.length > 0) {
      result.search_results = searchResults;
    }

    // Extract knowledge_graph from the first search that has it
    if (serpData?.knowledge_graph && !result.knowledge_graph.exists) {
      const kg = serpData.knowledge_graph as Record<string, unknown>;
      result.knowledge_graph.exists = true;
      result.knowledge_graph.title = (kg.title as string) || null;
      result.knowledge_graph.rating = kg.rating != null ? parseFloat(String(kg.rating)) : null;
      result.knowledge_graph.review_count = kg.review_count != null
        ? parseInt(String(kg.review_count).replace(/[^\d]/g, ""), 10) || null
        : null;
      result.knowledge_graph.has_hours = !!(kg.hours || kg.opening_hours || kg.sunday || kg.monday);
      const kgWebsite = (kg.website as string) || "";
      result.knowledge_graph.website_matches = kgWebsite.includes(hostname);
    }

    // Extract local_results (map results) from the first search that has them
    if (serpData?.local_results && !result.local_results.exists) {
      const lr = serpData.local_results as Record<string, unknown>;
      const places = (lr.places || []) as Array<Record<string, unknown>>;
      if (places.length > 0) {
        // Try to find the company in local results
        const match = places.find((p) => {
          const link = (p.link as string) || "";
          return link.includes(hostname);
        });
        const place = match || places[0];
        result.local_results.exists = true;
        result.local_results.rating = place.rating != null ? parseFloat(String(place.rating)) : null;
        result.local_results.reviews = place.reviews != null
          ? parseInt(String(place.reviews).replace(/[^\d]/g, ""), 10) || null
          : null;
        result.local_results.position = match ? (places.indexOf(match) + 1) : null;
      }
    }
  }

  result.google_profil_hittad = result.knowledge_graph.exists || result.local_results.exists;

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
  googleProfile: GoogleProfile,
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
    googleProfile: {
      google_profil_hittad: googleProfile.google_profil_hittad,
      knowledge_graph: googleProfile.knowledge_graph,
      local_results: googleProfile.local_results,
      found_in_search: googleProfile.found_in_search,
      search_position: googleProfile.search_position,
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

Google-synbarhetsdatan kommer från SerpApi och innehåller:
- knowledge_graph: företagets Google-profil (sidopanelen i sökresultatet). Finns den? Vilken titel? Betyg? Antal recensioner? Finns öppettider? Matchar webbadressen den skannade domänen?
- local_results: kartresultaten. Finns företaget med? Betyg? Recensioner? Position i listan?
- found_in_search + search_position: finns hemsidan i de vanliga sökresultaten och på vilken plats.
- google_profil_hittad: sammanfattning av ovan — true om företaget finns i knowledge_graph eller local_results.

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
- Om du inte har skärmbilder, basera bedömningen på HTML och PageSpeed-data.
- För google_visibility-området: basera bedömningen på knowledge_graph, local_results och found_in_search.
  Om företaget inte har en Google-profil eller inte syns i sökresultatet, markera området som "kan_forbattras"
  och föreslå konkreta åtgärder (skapa Google-profil, lägga till på Google Maps, etc.).`,
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

    // Step 3: Google visibility via SerpApi
    const hostname = getHostname(url);
    const googleProfile = await runGoogleVisibility(companyName, ort, hostname);
    await updateScan(scanId, { step: 4 });

    // Step 4: AI assessment
    const aiAssessment = await runAIAssessment(
      browserless.mobileScreenshot,
      browserless.desktopScreenshot,
      browserless.renderedHtml,
      pageSpeed,
      googleProfile,
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
      googleProfile,
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
        return json({ error: "Du har gjort för många kollar idag. Försök igen imorgon." }, 429);
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
