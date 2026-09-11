import { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Smartphone,
  Search,
  Gauge,
  Eye,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Monitor,
  Tablet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface ScanResult {
  url: string;
  finalUrl: string;
  httpStatus: number;
  redirected: boolean;
  isHttps: boolean;
  responseTimeMs: number;
  headers: Record<string, string>;
  meta: {
    title: string | null;
    description: string | null;
    viewport: string | null;
    canonical: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImage: string | null;
  };
  h1Count: number;
  imgWithoutAlt: number;
  totalImages: number;
  hasStructuredData: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  scores: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    mobile: number | null;
    security: number | null;
  };
  screenshots: {
    mobile: string | null;
    desktop: string | null;
  };
  recommendations: string[];
  summary: string | null;
}

function getUrlParam(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('url') || '';
}

function normalizeDisplay(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : 'https://' + url).hostname;
  } catch {
    return url;
  }
}

function ScoreBar({ score, label }: { score: number | null; label: string }) {
  if (score === null) {
    return (
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-text-muted">{label}</span>
          <span className="text-sm text-text-dim">—</span>
        </div>
        <div className="score-bar" />
      </div>
    );
  }
  const color = score >= 75 ? '#C6FF3D' : score >= 55 ? '#FFB340' : '#FF4D4D';
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-text-muted">{label}</span>
        <span className="font-serif text-2xl sm:text-3xl font-light text-text">{score}</span>
      </div>
      <div className="score-bar">
        <div
          className="score-bar__fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

function CheckItem({
  pass,
  label,
  value,
}: {
  pass: boolean | null;
  label: string;
  value?: string;
}) {
  const Icon =
    pass === null ? AlertTriangle : pass ? CheckCircle2 : XCircle;
  const color =
    pass === null ? 'text-text-dim' : pass ? 'text-accent' : 'text-red-400';

  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
      <div className="min-w-0">
        <span className="text-sm text-text-muted">{label}</span>
        {value && (
          <p className="text-xs text-text-dim mt-0.5 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

function ScreenshotCarousel({
  mobile,
  desktop,
}: {
  mobile: string | null;
  desktop: string | null;
}) {
  const items = [
    ...(desktop ? [{ label: 'Desktop', icon: <Monitor className="w-4 h-4" />, src: desktop }] : []),
    ...(desktop ? [{ label: 'Tablet', icon: <Tablet className="w-4 h-4" />, src: desktop }] : []),
    ...(mobile ? [{ label: 'Mobil', icon: <Smartphone className="w-4 h-4" />, src: mobile }] : []),
  ];

  const [active, setActive] = useState(0);

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {items.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActive(i)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs border transition-colors duration-200 ${
              active === i
                ? 'border-border text-text bg-bg-elev'
                : 'border-border-subtle text-text-dim hover:text-text-muted'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
      <div className="relative overflow-hidden bg-bg-elev border border-border-subtle p-2">
        <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 left-2 right-2 z-10 pointer-events-none">
          {items.length > 1 && (
            <>
              <button
                onClick={() => setActive((a) => (a - 1 + items.length) % items.length)}
                className="pointer-events-auto w-7 h-7 flex items-center justify-center bg-bg/80 border border-border text-text-muted hover:text-text"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActive((a) => (a + 1) % items.length)}
                className="pointer-events-auto w-7 h-7 flex items-center justify-center bg-bg/80 border border-border text-text-muted hover:text-text"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        <img
          src={items[active].src}
          alt={`${items[active].label} vy`}
          className={`mx-auto object-contain ${
            items[active].label === 'Mobil'
              ? 'max-w-[280px]'
              : items[active].label === 'Tablet'
              ? 'max-w-[500px]'
              : 'w-full max-w-[800px]'
          }`}
        />
      </div>
    </div>
  );
}

export default function ScanPage() {
  const [inputUrl, setInputUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const hasRun = useRef(false);

  const runScan = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    setScanning(true);
    setResult(null);
    setError('');
    setProgress('Hämtar sidan...');

    const progressSteps = [
      { text: 'Analyserar HTML och metadata...', delay: 3000 },
      { text: 'Kontrollerar prestanda via Google...', delay: 6000 },
      { text: 'Skapar skärmbilder...', delay: 12000 },
      { text: 'Sammanfattar resultaten...', delay: 20000 },
    ];

    const timers = progressSteps.map((step) =>
      setTimeout(() => setProgress(step.text), step.delay)
    );

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/site-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Analysen misslyckades');
      }

      const data: ScanResult = await res.json();
      if (!data.scores) {
        throw new Error('Kunde inte analysera sidan');
      }
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Kunde inte nå sidan. Kontrollera adressen och försök igen.'
      );
    } finally {
      timers.forEach(clearTimeout);
      setScanning(false);
      setProgress('');
    }
  };

  useEffect(() => {
    if (hasRun.current) return;
    const param = getUrlParam();
    if (param) {
      hasRun.current = true;
      setInputUrl(param);
      runScan(param);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runScan(inputUrl);
  };

  const validScores = result?.scores
    ? [
        result.scores.performance,
        result.scores.seo,
        result.scores.accessibility,
        result.scores.security,
        result.scores.mobile,
      ].filter((s): s is number => s !== null)
    : [];

  const overallScore =
    validScores.length >= 2
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : null;

  const categories = result
    ? [
        { label: 'Performance', score: result.scores.performance, icon: <Gauge className="w-5 h-5" /> },
        { label: 'Mobile', score: result.scores.mobile, icon: <Smartphone className="w-5 h-5" /> },
        { label: 'SEO', score: result.scores.seo, icon: <Search className="w-5 h-5" /> },
        { label: 'Accessibility', score: result.scores.accessibility, icon: <Eye className="w-5 h-5" /> },
        { label: 'Security', score: result.scores.security, icon: <ShieldCheck className="w-5 h-5" /> },
      ]
    : [];

  return (
    <section className="min-h-screen pt-36 sm:pt-44 pb-20 sm:pb-32 bg-bg noise">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-14 sm:mb-20 fade-in">
          <span className="section-label mb-6 block">N° 04 — Scan Tool</span>
          <h1 className="font-serif text-[clamp(2.25rem,5.5vw,4.5rem)] font-light leading-[1.0] text-text tracking-tight max-w-3xl text-balance mb-6">
            Your website.{' '}
            <span className="font-serif-italic text-accent">Under the microscope.</span>
          </h1>
          <p className="text-base sm:text-lg text-text-muted leading-[1.55] max-w-lg text-pretty">
            See how your website performs across speed, mobile experience, SEO and first impression.
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-16 fade-in">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://yourwebsite.se"
                className="w-full pl-11 pr-5 py-4 bg-bg-elev border border-border text-text placeholder:text-text-dim text-[15px] focus:outline-none focus:border-accent transition-colors duration-300"
              />
            </div>
            <button
              type="submit"
              disabled={scanning}
              className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-accent text-bg text-[14px] font-medium hover:bg-accent-dim transition-colors duration-300 shrink-0 disabled:opacity-60"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyserar...
                </>
              ) : (
                <>
                  Analyse website
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Scanning */}
        {scanning && (
          <div className="flex flex-col items-center justify-center py-20 fade-in">
            <div className="relative mb-6">
              <div className="w-16 h-16 border border-border-subtle rounded-full flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
            <p className="text-text-muted text-sm">{progress}</p>
            <p className="text-text-dim text-xs mt-2">
              Detta kan ta upp till 30 sekunder
            </p>
          </div>
        )}

        {/* Error */}
        {error && !scanning && (
          <div className="py-12 text-center fade-in">
            <XCircle className="w-6 h-6 text-red-400 mx-auto mb-3" />
            <p className="text-text-muted text-sm">{error}</p>
            <p className="text-text-dim text-xs mt-2">
              Kontrollera att adressen stämmer och försök igen.
            </p>
          </div>
        )}

        {/* Results */}
        {result && !scanning && (
          <div className="space-y-16 fade-in">
            {/* AI Summary */}
            {result.summary && (
              <div className="bg-bg-elev border border-border-subtle p-6 sm:p-8 max-w-3xl">
                <p className="text-text-muted text-[15px] leading-[1.7] italic">
                  "{result.summary}"
                </p>
              </div>
            )}

            {/* Overall score */}
            <div className="border-b border-border-subtle pb-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                {overallScore !== null ? (
                  <div>
                    <div className="section-label mb-2">Overall Score</div>
                    <div className="font-serif text-[clamp(4rem,10vw,8rem)] font-light leading-none text-text tracking-tight">
                      {overallScore}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="section-label mb-2">Overall Score</div>
                    <div className="font-serif text-4xl text-text-dim">—</div>
                  </div>
                )}
                <div className="sm:ml-8 sm:pb-4">
                  <p className="text-text-muted text-sm">
                    {normalizeDisplay(result.finalUrl)}
                  </p>
                  <p className="text-text-dim text-xs mt-1">
                    {result.responseTimeMs}ms svarstid
                    {validScores.length > 0 && validScores.length < 5 && (
                      <span className="ml-2">
                        ({validScores.length} av 5 kategorier)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Category scores — editorial bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
              {categories.map((cat) => (
                <div key={cat.label} className="space-y-3">
                  <div className="flex items-center gap-3 text-text-muted">
                    {cat.icon}
                    <span className="text-sm font-medium text-text">{cat.label}</span>
                  </div>
                  <ScoreBar score={cat.score} label="" />
                </div>
              ))}
            </div>

            {/* Screenshots */}
            {(result.screenshots.mobile || result.screenshots.desktop) && (
              <div className="pt-10 border-t border-border-subtle">
                <h3 className="section-label mb-6">Screenshots</h3>
                <ScreenshotCarousel
                  mobile={result.screenshots.mobile}
                  desktop={result.screenshots.desktop}
                />
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="pt-10 border-t border-border-subtle">
                <h3 className="section-label mb-6">Recommendations</h3>
                <ul className="space-y-4 max-w-2xl">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 text-text-muted text-[15px] leading-[1.6]">
                      <span className="text-accent mt-0.5 shrink-0">—</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendations && result.recommendations.length === 0 && (
              <div className="pt-10 border-t border-border-subtle">
                <h3 className="section-label mb-4">Recommendations</h3>
                <p className="text-text-muted text-[15px]">
                  Inga uppenbara brister hittades. Sidan ser bra ut.
                </p>
              </div>
            )}

            {/* Technical details */}
            <div className="pt-10 border-t border-border-subtle grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div>
                <h4 className="section-label mb-4">SEO</h4>
                <div className="space-y-0.5">
                  <CheckItem
                    pass={result.meta.title !== null}
                    label="Meta title"
                    value={result.meta.title || 'Saknas'}
                  />
                  <CheckItem
                    pass={result.meta.description !== null}
                    label="Meta description"
                    value={
                      result.meta.description
                        ? result.meta.description.slice(0, 80) + '...'
                        : 'Saknas'
                    }
                  />
                  <CheckItem
                    pass={result.h1Count === 1}
                    label="H1-rubrik"
                    value={
                      result.h1Count === 1
                        ? '1 st (korrekt)'
                        : `${result.h1Count} st`
                    }
                  />
                  <CheckItem pass={result.meta.canonical !== null} label="Canonical-tagg" />
                  <CheckItem pass={result.hasRobotsTxt} label="robots.txt" />
                  <CheckItem pass={result.hasSitemap} label="sitemap.xml" />
                  <CheckItem pass={result.hasStructuredData} label="Strukturerad data" />
                </div>
              </div>

              <div>
                <h4 className="section-label mb-4">Accessibility & Mobile</h4>
                <div className="space-y-0.5">
                  <CheckItem
                    pass={result.meta.viewport !== null}
                    label="Viewport meta"
                    value={result.meta.viewport || 'Saknas'}
                  />
                  <CheckItem
                    pass={
                      result.totalImages === 0
                        ? null
                        : result.imgWithoutAlt === 0
                    }
                    label="Alt-attribut på bilder"
                    value={
                      result.totalImages === 0
                        ? 'Inga bilder hittades'
                        : `${result.imgWithoutAlt} av ${result.totalImages} saknar alt`
                    }
                  />
                  <CheckItem
                    pass={result.meta.ogTitle !== null}
                    label="Open Graph"
                    value={result.meta.ogTitle || 'Saknas'}
                  />
                  <CheckItem
                    pass={result.meta.ogImage !== null}
                    label="OG-bild"
                  />
                </div>
              </div>

              <div>
                <h4 className="section-label mb-4">Security & Tech</h4>
                <div className="space-y-0.5">
                  <CheckItem pass={result.isHttps} label="HTTPS" />
                  <CheckItem
                    pass={!!result.headers['strict-transport-security']}
                    label="HSTS-header"
                  />
                  <CheckItem
                    pass={!!result.headers['x-content-type-options']}
                    label="X-Content-Type-Options"
                  />
                  <CheckItem
                    pass={
                      !!result.headers['x-frame-options'] ||
                      !!result.headers['content-security-policy']
                    }
                    label="Clickjacking-skydd"
                  />
                  <CheckItem
                    pass={result.httpStatus >= 200 && result.httpStatus < 400}
                    label="HTTP-status"
                    value={result.httpStatus ? `${result.httpStatus}` : 'Kunde inte nås'}
                  />
                  <CheckItem
                    pass={!result.redirected}
                    label="Inga omdirigeringar"
                    value={result.redirected ? `Omdirigerar till ${normalizeDisplay(result.finalUrl)}` : undefined}
                  />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-12 border-t border-border-subtle">
              <h3 className="font-serif text-2xl sm:text-3xl text-text mb-4 font-light tracking-tight">
                Vill du ta nästa steg?
              </h3>
              <p className="text-text-muted text-base leading-[1.6] max-w-xl mb-8 text-pretty">
                Det finns mer att titta på än vad som ryms i en snabbanalys. Boka ett kort
                samtal så berättar jag vad jag ser — och vad som skulle göra störst skillnad.
              </p>
              <a href="/demo" className="btn-accent group">
                Start a project
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>

            {/* Explore more */}
            <div className="pt-8 border-t border-border-subtle flex flex-wrap gap-6 text-sm">
              <a href="/#arbete" className="text-text-dim hover:text-text transition-colors">
                <span className="link-underline">Se tidigare projekt</span>
              </a>
              <a href="/#om" className="text-text-dim hover:text-text transition-colors">
                <span className="link-underline">Om Otto</span>
              </a>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!scanning && !result && !error && (
          <div className="py-16 text-center">
            <p className="text-text-dim text-sm">
              Skriv in en adress ovan för att starta analysen.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
