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

function ScoreRing({ score, size = 72 }: { score: number | null; size?: number }) {
  if (score === null) {
    return (
      <div
        className="inline-flex flex-col items-center justify-center gap-1"
        style={{ width: size, height: size + 16 }}
      >
        <div
          className="relative inline-flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <svg className="absolute inset-0" width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={(size - 8) / 2}
              fill="none"
              stroke="currentColor"
              strokeWidth={4}
              className="text-ink/8"
            />
          </svg>
          <span className="text-xs text-ink/40">—</span>
        </div>
        <span className="text-[10px] text-ink/40 text-center leading-tight">
          Kunde inte analyseras
        </span>
      </div>
    );
  }

  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75 ? 'text-emerald-600' : score >= 55 ? 'text-amber-500' : 'text-red-500';

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          className="text-ink/8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${color} transition-all duration-1000 ease-out`}
        />
      </svg>
      <span className="text-lg font-medium text-ink">{score}</span>
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
    pass === null ? 'text-ink/40' : pass ? 'text-emerald-600' : 'text-red-500';

  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
      <div className="min-w-0">
        <span className="text-sm text-ink/80">{label}</span>
        {value && (
          <p className="text-xs text-ink/50 mt-0.5 truncate">{value}</p>
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
                ? 'border-ink/30 text-ink bg-white'
                : 'border-ink/10 text-ink/50 hover:text-ink/70'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
      <div className="relative overflow-hidden bg-white border border-ink/10 p-2">
        <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 left-2 right-2 z-10 pointer-events-none">
          {items.length > 1 && (
            <>
              <button
                onClick={() => setActive((a) => (a - 1 + items.length) % items.length)}
                className="pointer-events-auto w-7 h-7 flex items-center justify-center bg-white/80 border border-ink/10 text-ink/60 hover:text-ink"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActive((a) => (a + 1) % items.length)}
                className="pointer-events-auto w-7 h-7 flex items-center justify-center bg-white/80 border border-ink/10 text-ink/60 hover:text-ink"
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
        { label: 'Prestanda', score: result.scores.performance, icon: <Gauge className="w-5 h-5" /> },
        { label: 'SEO', score: result.scores.seo, icon: <Search className="w-5 h-5" /> },
        { label: 'Tillgänglighet', score: result.scores.accessibility, icon: <Eye className="w-5 h-5" /> },
        { label: 'Säkerhet', score: result.scores.security, icon: <ShieldCheck className="w-5 h-5" /> },
        { label: 'Mobil', score: result.scores.mobile, icon: <Smartphone className="w-5 h-5" /> },
      ]
    : [];

  return (
    <section className="min-h-screen pt-36 sm:pt-44 pb-20 sm:pb-32 bg-cream">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="grid grid-cols-12 gap-y-6 mb-14 sm:mb-20">
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
            <span className="eyebrow text-ink/50">Verktyg</span>
            <span className="eyebrow text-ink/50">Hemsidecheck</span>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-serif text-[clamp(2.25rem,5.5vw,4.5rem)] font-light leading-[1.05] text-ink tracking-tight max-w-3xl text-balance">
              Se hur din hemsida <span className="font-serif-italic text-gold">presterar</span>{' '}
              idag.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-ink/65 leading-[1.6] max-w-2xl text-pretty">
              Ange din adress nedan. Jag kontrollerar prestanda, SEO, säkerhet och
              mobilvänlighet med hjälp av Googles verktyg och en direkt analys av din sida.
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-16">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/35" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="www.dittforetag.se"
                className="w-full pl-11 pr-5 py-4 bg-white border border-ink/12 text-ink placeholder:text-ink/40 text-[15px] focus:outline-none focus:border-ink/30 transition-colors duration-300"
              />
            </div>
            <button
              type="submit"
              disabled={scanning}
              className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-ink text-cream text-[14px] tracking-wide hover:bg-navy transition-colors duration-300 shrink-0 disabled:opacity-60"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyserar...
                </>
              ) : (
                <>
                  Analysera
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Scanning */}
        {scanning && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
            <p className="text-ink/60 text-sm">{progress}</p>
            <p className="text-ink/40 text-xs mt-2">
              Detta kan ta upp till 30 sekunder
            </p>
          </div>
        )}

        {/* Error */}
        {error && !scanning && (
          <div className="py-12 text-center">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-3" />
            <p className="text-ink/70 text-sm">{error}</p>
            <p className="text-ink/45 text-xs mt-2">
              Kontrollera att adressen stämmer och försök igen.
            </p>
          </div>
        )}

        {/* Results */}
        {result && !scanning && (
          <div className="space-y-16">
            {/* AI Summary */}
            {result.summary && (
              <div className="bg-white border border-ink/10 p-6 sm:p-8 max-w-3xl">
                <p className="text-ink/80 text-[15px] leading-[1.7] italic">
                  "{result.summary}"
                </p>
              </div>
            )}

            {/* Overall score + categories */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-10 border-b border-ink/10">
              {overallScore !== null ? (
                <ScoreRing score={overallScore} size={88} />
              ) : (
                <div className="w-[88px] h-[88px] flex items-center justify-center">
                  <span className="text-xs text-ink/40 text-center">Kunde inte beräknas</span>
                </div>
              )}
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink mb-1">
                  Övergripande betyg
                </h2>
                <p className="text-ink/60 text-sm">
                  {normalizeDisplay(result.finalUrl)} — {result.responseTimeMs}ms svarstid
                  {validScores.length > 0 && validScores.length < 5 && (
                    <span className="ml-2 text-ink/40">
                      (baserat på {validScores.length} av 5 kategorier)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {categories.map((cat) => (
                <div key={cat.label} className="space-y-3">
                  <div className="flex items-center gap-3 text-ink/60">
                    {cat.icon}
                    <span className="text-sm font-medium text-ink">{cat.label}</span>
                  </div>
                  <ScoreRing score={cat.score} size={64} />
                </div>
              ))}
            </div>

            {/* Screenshots */}
            {(result.screenshots.mobile || result.screenshots.desktop) && (
              <div className="pt-10 border-t border-ink/10">
                <h3 className="font-serif text-xl sm:text-2xl text-ink mb-6">
                  Skärmbilder
                </h3>
                <ScreenshotCarousel
                  mobile={result.screenshots.mobile}
                  desktop={result.screenshots.desktop}
                />
              </div>
            )}

            {/* Recommendations (data-driven, from backend) */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="pt-10 border-t border-ink/10">
                <h3 className="font-serif text-xl sm:text-2xl text-ink mb-6">
                  Förbättringsmöjligheter
                </h3>
                <ul className="space-y-4 max-w-2xl">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 text-ink/70 text-[15px] leading-[1.6]">
                      <span className="text-gold mt-0.5 shrink-0">—</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendations && result.recommendations.length === 0 && (
              <div className="pt-10 border-t border-ink/10">
                <h3 className="font-serif text-xl sm:text-2xl text-ink mb-4">
                  Förbättringsmöjligheter
                </h3>
                <p className="text-ink/60 text-[15px]">
                  Inga uppenbara brister hittades. Sidan ser bra ut baserat på de kontroller som gjorts.
                </p>
              </div>
            )}

            {/* Technical details */}
            <div className="pt-10 border-t border-ink/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {/* SEO */}
              <div>
                <h4 className="eyebrow text-ink/50 mb-4">SEO</h4>
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

              {/* Tillgänglighet & Mobil */}
              <div>
                <h4 className="eyebrow text-ink/50 mb-4">Tillgänglighet & Mobil</h4>
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

              {/* Säkerhet */}
              <div>
                <h4 className="eyebrow text-ink/50 mb-4">Säkerhet & Teknik</h4>
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
            <div className="pt-12 border-t border-ink/10">
              <h3 className="font-serif text-2xl sm:text-3xl text-ink mb-4">
                Vill du ta nästa steg?
              </h3>
              <p className="text-ink/65 text-base leading-[1.6] max-w-xl mb-8 text-pretty">
                Det finns mer att titta på än vad som ryms i en snabbanalys. Boka ett kort
                samtal så berättar jag vad jag ser — och vad som skulle göra störst skillnad
                för din verksamhet.
              </p>
              <a
                href="/#kontakt"
                className="inline-flex items-center gap-3 px-7 py-4 bg-ink text-cream text-[14px] tracking-wide hover:bg-navy transition-colors duration-300"
              >
                Boka ett kostnadsfritt samtal
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Explore more */}
            <div className="pt-8 border-t border-ink/10 flex flex-wrap gap-6 text-sm">
              <a href="/#arbete" className="text-ink/60 hover:text-ink transition-colors">
                <span className="link-underline">Se tidigare projekt</span>
              </a>
              <a href="/#om" className="text-ink/60 hover:text-ink transition-colors">
                <span className="link-underline">Om Otto</span>
              </a>
              <a href="/#pris" className="text-ink/60 hover:text-ink transition-colors">
                <span className="link-underline">Priser</span>
              </a>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!scanning && !result && !error && (
          <div className="py-16 text-center">
            <p className="text-ink/50 text-sm">
              Skriv in en adress ovan för att starta analysen.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
