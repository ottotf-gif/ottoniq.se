import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PageSpeedResult {
  score: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
  metrics: {
    fcp: number | null;
    lcp: number | null;
    cls: number | null;
    tbt: number | null;
    si: number | null;
  };
  screenshot: string | null;
}

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  // Remove trailing slash for consistency
  if (url.endsWith("/") && url.split("/").length > 4) {
    url = url.slice(0, -1);
  }
  return url;
}

function extractMeta(html: string) {
  const get = (pattern: RegExp): string | null => {
    const m = html.match(pattern);
    return m ? m[1].trim() : null;
  };

  const title = get(/<title[^>]*>([^<]+)<\/title>/i) || null;
  const description =
    get(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
    get(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const viewport =
    get(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/i) ||
    get(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']viewport["']/i);
  const canonical =
    get(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
    get(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  const ogTitle =
    get(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
    get(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  const ogDescription =
    get(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
    get(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
  const ogImage =
    get(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
    get(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

  const h1Matches = html.match(/<h1[\s>]/gi);
  const h1Count = h1Matches ? h1Matches.length : 0;

  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const totalImages = imgMatches.length;
  const imgWithoutAlt = imgMatches.filter(
    (tag) => !tag.match(/alt=["'][^"']+["']/i)
  ).length;

  const hasStructuredData =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>/i.test(html);

  return {
    title,
    description,
    viewport,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    h1Count,
    totalImages,
    imgWithoutAlt,
    hasStructuredData,
  };
}

async function checkResource(baseUrl: string, path: string): Promise<boolean> {
  try {
    const url = new URL(path, baseUrl).href;
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function fetchPageSpeed(
  url: string,
  strategy: "mobile" | "desktop"
): Promise<PageSpeedResult | null> {
  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url
    )}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;

    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) return null;

    const data = await res.json();
    const lr = data.lighthouseResult;
    if (!lr) return null;

    const cats = lr.categories || {};
    const audits = lr.audits || {};
    const screenshot = audits["final-screenshot"]?.details?.data || null;
    const metrics = audits["metrics"]?.details?.items?.[0] || {};

    return {
      score: {
        performance: cats.performance?.score != null ? Math.round(cats.performance.score * 100) : null,
        accessibility: cats.accessibility?.score != null ? Math.round(cats.accessibility.score * 100) : null,
        bestPractices: cats["best-practices"]?.score != null ? Math.round(cats["best-practices"].score * 100) : null,
        seo: cats.seo?.score != null ? Math.round(cats.seo.score * 100) : null,
      },
      metrics: {
        fcp: metrics.firstContentfulPaint ?? null,
        lcp: metrics.largestContentfulPaint ?? null,
        cls: metrics.cumulativeLayoutShift ?? null,
        tbt: metrics.totalBlockingTime ?? null,
        si: metrics.speedIndex ?? null,
      },
      screenshot,
    };
  } catch {
    return null;
  }
}

function calculateScores(data: {
  pagespeed: { mobile: PageSpeedResult | null; desktop: PageSpeedResult | null };
  isHttps: boolean;
  responseTimeMs: number;
  meta: { title: string | null; description: string | null; viewport: string | null; canonical: string | null; ogTitle: string | null };
  h1Count: number;
  imgWithoutAlt: number;
  totalImages: number;
  hasStructuredData: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  headers: Record<string, string>;
}) {
  const psMobile = data.pagespeed.mobile?.score;
  const psDesktop = data.pagespeed.desktop?.score;

  // Performance: PageSpeed if available, otherwise a real signal (measured server response time)
  let performance = psDesktop?.performance ?? psMobile?.performance ?? null;
  if (performance === null) {
    const t = data.responseTimeMs;
    performance = t <= 500 ? 95 : t <= 1000 ? 80 : t <= 2000 ? 60 : t <= 4000 ? 40 : 20;
  }

  // SEO: PageSpeed if available, otherwise verifiable on-page checks
  let seo = psMobile?.seo ?? psDesktop?.seo ?? null;
  if (seo === null) {
    let seoChecks = 0;
    let seoScore = 0;
    seoChecks++; if (data.meta.title && data.meta.title.length >= 10 && data.meta.title.length <= 65) seoScore++;
    seoChecks++; if (data.meta.description && data.meta.description.length >= 50) seoScore++;
    seoChecks++; if (data.meta.canonical) seoScore++;
    seoChecks++; if (data.h1Count === 1) seoScore++;
    seoChecks++; if (data.hasStructuredData) seoScore++;
    seoChecks++; if (data.hasRobotsTxt) seoScore++;
    seoChecks++; if (data.hasSitemap) seoScore++;
    seoChecks++; if (data.meta.ogTitle) seoScore++;
    seo = Math.round((seoScore / seoChecks) * 100);
  }

  // Accessibility: PageSpeed if available, otherwise verifiable checks
  let accessibility = psMobile?.accessibility ?? psDesktop?.accessibility ?? null;
  if (accessibility === null) {
    let a11yChecks = 0;
    let a11yScore = 0;
    a11yChecks++; if (data.meta.viewport) a11yScore++;
    a11yChecks++; if (data.h1Count >= 1) a11yScore++;
    a11yChecks++; if (data.totalImages === 0 || data.imgWithoutAlt === 0) a11yScore++;
    a11yChecks++; if (data.totalImages === 0 || (data.imgWithoutAlt / data.totalImages) <= 0.2) a11yScore++;
    accessibility = Math.round((a11yScore / a11yChecks) * 100);
  }

  // Security: calculated from verifiable binary checks (always reliable)
  let secScore = 0;
  let secChecks = 0;
  secChecks++; if (data.isHttps) secScore++;
  secChecks++; if (data.headers["strict-transport-security"]) secScore++;
  secChecks++; if (data.headers["x-content-type-options"]) secScore++;
  secChecks++; if (data.headers["x-frame-options"] || data.headers["content-security-policy"]) secScore++;
  const security = Math.round((secScore / secChecks) * 100);

  // Mobile: PageSpeed mobile performance if available, otherwise viewport-based signal
  let mobile = psMobile?.performance ?? null;
  if (mobile === null) {
    const vp = data.meta.viewport || "";
    mobile = vp.includes("width=device-width") ? 85 : vp ? 60 : 25;
  }

  // Best Practices: PageSpeed if available, otherwise verifiable checks
  let bestPractices = psMobile?.bestPractices ?? psDesktop?.bestPractices ?? null;
  if (bestPractices === null) {
    let bpChecks = 0;
    let bpScore = 0;
    bpChecks++; if (data.isHttps) bpScore++;
    bpChecks++; if (data.hasStructuredData) bpScore++;
    bpChecks++; if (data.meta.canonical) bpScore++;
    bpChecks++; if (data.headers["x-content-type-options"]) bpScore++;
    bestPractices = Math.round((bpScore / bpChecks) * 100);
  }

  return { performance, seo, accessibility, security, mobile, bestPractices };
}
  
function generateRecommendations(data: {
  scores: { performance: number | null; seo: number | null; accessibility: number | null; security: number | null; mobile: number | null };
  meta: { title: string | null; description: string | null; viewport: string | null; canonical: string | null; ogTitle: string | null; ogImage: string | null };
  h1Count: number;
  imgWithoutAlt: number;
  totalImages: number;
  hasStructuredData: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  isHttps: boolean;
  headers: Record<string, string>;
}): string[] {
  const recs: string[] = [];

  // Performance
  if (data.scores.performance !== null && data.scores.performance < 50) {
    recs.push("Sidan laddar betydligt långsammare än rekommenderat. Optimering av bilder, kod och serverrespons skulle göra stor skillnad.");
  } else if (data.scores.performance !== null && data.scores.performance < 75) {
    recs.push("Laddtiden kan förbättras. Bildoptimering och caching är ofta de enklaste vinsterna.");
  }

  // Mobile
  if (data.scores.mobile !== null && data.scores.mobile < 50) {
    recs.push("Mobilupplevelsen behöver förbättras — sidan laddar för långsamt på telefoner.");
  }

  // SEO specifics
  if (!data.meta.title) recs.push("Sidan saknar en meta-title, vilket gör det svårt för Google att visa en relevant rubrik i sökresultaten.");
  if (!data.meta.description) recs.push("Meta-description saknas. Utan den väljer Google själv vilken text som visas i sökresultaten.");
  if (data.h1Count === 0) recs.push("Ingen H1-rubrik hittades. En tydlig huvudrubrik hjälper sökmotorer förstå sidans ämne.");
  if (data.h1Count > 1) recs.push(`Sidan har ${data.h1Count} st H1-rubriker. Vanligtvis ska det bara finnas en.`);
  if (!data.hasRobotsTxt) recs.push("Filen robots.txt saknas, vilket kan påverka hur sökmotorer indexerar sidan.");
  if (!data.hasSitemap) recs.push("Ingen sitemap.xml hittades. En sitemap hjälper sökmotorer hitta alla sidor.");
  if (!data.meta.canonical) recs.push("Canonical-tagg saknas, vilket kan leda till duplicerat innehåll i sökresultaten.");

  // Accessibility
  if (data.imgWithoutAlt > 0 && data.totalImages > 0) {
    recs.push(`${data.imgWithoutAlt} av ${data.totalImages} bilder saknar alt-text, vilket påverkar tillgängligheten.`);
  }
  if (!data.meta.viewport) recs.push("Viewport-meta saknas, vilket gör att sidan inte anpassar sig korrekt på mobila enheter.");

  // Open Graph
  if (!data.meta.ogTitle && !data.meta.ogImage) {
    recs.push("Open Graph-taggar saknas. Utan dem ser delningar på sociala medier oprofessionella ut.");
  }

  // Security
  if (!data.isHttps) recs.push("Sidan använder inte HTTPS. Det är idag ett minimumkrav för säkerhet och sökmotorranking.");
  if (!data.headers["strict-transport-security"]) recs.push("HSTS-header saknas. Den skyddar besökare från att av misstag använda en osäker anslutning.");

  // Structured data
  if (!data.hasStructuredData) recs.push("Ingen strukturerad data (Schema.org) hittades. Det kan ge bättre visning i sökresultat.");

  // Limit to top 5 most important
  return recs.slice(0, 5);
}

async function generateSummary(siteData: {
  finalUrl: string;
  isHttps: boolean;
  responseTimeMs: number;
  scores: { performance: number | null; seo: number | null; accessibility: number | null; security: number | null; mobile: number | null };
  meta: { title: string | null; description: string | null; viewport: string | null };
  imgWithoutAlt: number;
  totalImages: number;
  hasStructuredData: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  recommendations: string[];
}): Promise<string | null> {
  const openaiKey = Deno.env.get("OPENAI_KEY") || Deno.env.get("VITE_OPENAI_KEY");
  if (!openaiKey) return null;

  const issueCount = siteData.recommendations.length;
  const hasGoodPerformance = siteData.scores.performance !== null && siteData.scores.performance >= 75;
  const hasGoodSeo = siteData.scores.seo !== null && siteData.scores.seo >= 75;

  const prompt = `Du är en svensk webbutvecklare som kort sammanfattar en hemsideanalys. Skriv 2-3 meningar på svenska. Var ärlig men vänlig. Basera ALLT på den data som ges — hitta INTE på problem som inte finns i datan. Om sidan har bra resultat, säg det. Skriv INTE poäng/siffror.

Data:
- URL: ${siteData.finalUrl}
- HTTPS: ${siteData.isHttps}
- Svarstid: ${siteData.responseTimeMs}ms
- Performance: ${siteData.scores.performance ?? "kunde inte mätas"}
- SEO: ${siteData.scores.seo ?? "kunde inte mätas"}
- Tillgänglighet: ${siteData.scores.accessibility ?? "kunde inte mätas"}
- Säkerhet: ${siteData.scores.security ?? "kunde inte mätas"}
- Mobil: ${siteData.scores.mobile ?? "kunde inte mätas"}
- Meta title: ${siteData.meta.title ? "finns" : "saknas"}
- Meta description: ${siteData.meta.description ? "finns" : "saknas"}
- Viewport: ${siteData.meta.viewport ? "finns" : "saknas"}
- Bilder utan alt: ${siteData.imgWithoutAlt}/${siteData.totalImages}
- Strukturerad data: ${siteData.hasStructuredData}
- robots.txt: ${siteData.hasRobotsTxt}
- sitemap.xml: ${siteData.hasSitemap}
- Antal förbättringsförslag: ${issueCount}
- Bra prestanda: ${hasGoodPerformance}
- Bra SEO: ${hasGoodSeo}

Regler:
- Nämn BARA problem som faktiskt finns i datan ovan.
- Om performance är "kunde inte mätas", säg INTE att sidan är snabb eller långsam.
- Om allt ser bra ut, beröm sidan kort.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 200,
        temperature: 0.5,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { url: rawUrl } = await req.json();
    if (!rawUrl || typeof rawUrl !== "string") {
      return new Response(
        JSON.stringify({ error: "URL krävs" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetUrl = normalizeUrl(rawUrl);

    // Fetch the page — follows redirects to normalize www vs non-www
    const startTime = Date.now();
    let httpStatus = 0;
    let finalUrl = targetUrl;
    let redirected = false;
    let html = "";
    let responseHeaders: Record<string, string> = {};

    try {
      const pageRes = await fetch(targetUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; OttoniqScan/1.0; +https://ottoniq.se)",
        },
      });
      httpStatus = pageRes.status;
      finalUrl = pageRes.url;
      redirected = pageRes.redirected;
      html = await pageRes.text();

      pageRes.headers.forEach((value, key) => {
        responseHeaders[key.toLowerCase()] = value;
      });
    } catch {
      return new Response(
        JSON.stringify({ error: "Kunde inte nå sidan. Kontrollera adressen och försök igen." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const responseTimeMs = Date.now() - startTime;
    const isHttps = finalUrl.startsWith("https://");

    // Parse HTML
    const metaResult = extractMeta(html);

    // Check robots.txt and sitemap using the final resolved origin
    const baseOrigin = new URL(finalUrl).origin;
    const [hasRobotsTxt, hasSitemap] = await Promise.all([
      checkResource(baseOrigin, "/robots.txt"),
      checkResource(baseOrigin, "/sitemap.xml"),
    ]);

    // Fetch PageSpeed using the final resolved URL (normalizes www)
    const [psMobile, psDesktop] = await Promise.all([
      fetchPageSpeed(finalUrl, "mobile"),
      fetchPageSpeed(finalUrl, "desktop"),
    ]);

    const scores = calculateScores({
      pagespeed: { mobile: psMobile, desktop: psDesktop },
      isHttps,
      responseTimeMs,
      meta: {
        title: metaResult.title,
        description: metaResult.description,
        viewport: metaResult.viewport,
        canonical: metaResult.canonical,
        ogTitle: metaResult.ogTitle,
      },
      h1Count: metaResult.h1Count,
      imgWithoutAlt: metaResult.imgWithoutAlt,
      totalImages: metaResult.totalImages,
      hasStructuredData: metaResult.hasStructuredData,
      hasRobotsTxt,
      hasSitemap,
      headers: responseHeaders,
    });

    // Generate data-driven recommendations (only for actual issues found)
    const recommendations = generateRecommendations({
      scores,
      meta: {
        title: metaResult.title,
        description: metaResult.description,
        viewport: metaResult.viewport,
        canonical: metaResult.canonical,
        ogTitle: metaResult.ogTitle,
        ogImage: metaResult.ogImage,
      },
      h1Count: metaResult.h1Count,
      imgWithoutAlt: metaResult.imgWithoutAlt,
      totalImages: metaResult.totalImages,
      hasStructuredData: metaResult.hasStructuredData,
      hasRobotsTxt,
      hasSitemap,
      isHttps,
      headers: responseHeaders,
    });

    const siteData = {
      url: rawUrl,
      finalUrl,
      httpStatus,
      redirected,
      isHttps,
      responseTimeMs,
      headers: responseHeaders,
      meta: {
        title: metaResult.title,
        description: metaResult.description,
        viewport: metaResult.viewport,
        canonical: metaResult.canonical,
        ogTitle: metaResult.ogTitle,
        ogDescription: metaResult.ogDescription,
        ogImage: metaResult.ogImage,
      },
      h1Count: metaResult.h1Count,
      imgWithoutAlt: metaResult.imgWithoutAlt,
      totalImages: metaResult.totalImages,
      hasStructuredData: metaResult.hasStructuredData,
      hasRobotsTxt,
      hasSitemap,
      pagespeed: { mobile: psMobile, desktop: psDesktop },
      scores,
      screenshots: {
        mobile: psMobile?.screenshot || null,
        desktop: psDesktop?.screenshot || null,
      },
      recommendations,
      summary: null as string | null,
    };

    // Generate AI summary based on real data
    siteData.summary = await generateSummary({
      finalUrl: siteData.finalUrl,
      isHttps: siteData.isHttps,
      responseTimeMs: siteData.responseTimeMs,
      scores: siteData.scores,
      meta: siteData.meta,
      imgWithoutAlt: siteData.imgWithoutAlt,
      totalImages: siteData.totalImages,
      hasStructuredData: siteData.hasStructuredData,
      hasRobotsTxt: siteData.hasRobotsTxt,
      hasSitemap: siteData.hasSitemap,
      recommendations: siteData.recommendations,
    });

    return new Response(JSON.stringify(siteData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Okänt fel" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
