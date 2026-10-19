import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  Globe,
  Search,
  Eye,
  Gauge,
  ArrowRight,
  Phone,
  RotateCw,
  ArrowLeft,
  Star,
} from 'lucide-react';

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabaseConfig';

interface ScanArea {
  id: string;
  title: string;
  status: 'bra' | 'kan_forbattras';
  summary: string;
}

interface ScanImprovement {
  id: string;
  title: string;
  description: string;
  priority: 'hojt' | 'medel' | 'lagt';
  area: string;
}

interface ScanAssessment {
  areas: ScanArea[];
  improvements: ScanImprovement[];
  overallSummary: string;
}

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

interface ScanResultData {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  step: number;
  result: {
    url: string;
    hostname: string;
    companyName: string | null;
    ort: string | null;
    screenshots: {
      mobile: string | null;
      desktop: string | null;
    };
    pageSpeed: {
      performance: number | null;
      accessibility: number | null;
      seo: number | null;
      lcp: number | null;
    };
    googleProfile: GoogleProfile;
    assessment: ScanAssessment | null;
    scannedAt: string;
  } | null;
  error: string | null;
  url: string;
  company_name: string | null;
  ort: string | null;
}

const STEPS = [
  { label: 'Hämtar sidan', icon: Globe },
  { label: 'Kontrollerar prestanda', icon: Gauge },
  { label: 'Kollar Google-synbarhet', icon: Search },
  { label: 'Bedömer intrycket', icon: Eye },
];

const AREA_ICONS: Record<string, typeof Smartphone> = {
  first_impression: Eye,
  mobile: Smartphone,
  google_visibility: Search,
  content: Globe,
  performance: Gauge,
};

function ProgressView({ step }: { step: number }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-6 border border-border-subtle">
            <Loader2 className="w-7 h-7 text-accent animate-spin" />
          </div>
          <h2 className="font-sans text-2xl font-light text-text mb-2">
            Analyserar din hemsida
          </h2>
          <p className="text-text-muted text-sm">
            Det här tar cirka 30–60 sekunder.
          </p>
        </div>

        <div className="space-y-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < step;
            const isActive = i === step;
            return (
              <div
                key={s.label}
                className={`flex items-center gap-4 px-4 py-3.5 border transition-all duration-300 ${
                  isActive
                    ? 'border-border bg-bg-elev'
                    : isDone
                    ? 'border-border-subtle bg-bg-elev/50'
                    : 'border-border-subtle opacity-50'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-accent animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-text-dim" />
                  )}
                </div>
                <span
                  className={`text-sm ${
                    isDone || isActive ? 'text-text' : 'text-text-dim'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AreaCard({ area }: { area: ScanArea }) {
  const Icon = AREA_ICONS[area.id] || Globe;
  const isGood = area.status === 'bra';

  return (
    <div className="border border-border-subtle p-5 bg-bg-elev/50">
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 flex items-center justify-center shrink-0 border ${
            isGood
              ? 'border-accent/30 text-accent'
              : 'border-amber-500/30 text-amber-400'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-sans text-base font-normal text-text">
              {area.title}
            </h3>
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 ${
                isGood
                  ? 'text-accent bg-accent/10'
                  : 'text-amber-400 bg-amber-500/10'
              }`}
            >
              {isGood ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              {isGood ? 'Bra' : 'Kan förbättras'}
            </span>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            {area.summary}
          </p>
        </div>
      </div>
    </div>
  );
}

function ImprovementCard({ imp, index }: { imp: ScanImprovement; index: number }) {
  return (
    <div className="border border-border-subtle p-5">
      <div className="flex items-start gap-4 mb-3">
        <span className="text-xs text-text-dim border border-border-subtle px-2 py-0.5 shrink-0">
          {index + 1}
        </span>
        <h4 className="font-sans text-base font-normal text-text leading-snug">
          {imp.title}
        </h4>
      </div>
      <p className="text-sm text-text-muted leading-relaxed">
        {imp.description}
      </p>
    </div>
  );
}

function PhoneFrame({ screenshot, hostname }: { screenshot: string | null; hostname: string }) {
  if (!screenshot) return null;

  return (
    <div className="flex justify-center">
      <div className="relative w-[300px] bg-bg-elev border border-border rounded-[2.5rem] p-3 shadow-2xl">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-bg-elev rounded-b-2xl z-10" />
        <div className="overflow-hidden rounded-[1.8rem] bg-bg">
          <div className="flex items-center justify-center gap-1.5 py-2 px-3 bg-bg-elev/80 border-b border-border-subtle">
            <div className="w-2 h-2 rounded-full bg-text-dim/40" />
            <span className="text-[10px] text-text-dim truncate max-w-[200px]">
              {hostname}
            </span>
          </div>
          <img
            src={screenshot}
            alt={`Mobil vy av ${hostname}`}
            className="w-full block"
          />
        </div>
      </div>
    </div>
  );
}

export default function ScanResult() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ScanResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/scan-website?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (res.status === 404) {
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        if (!res.ok) throw new Error('Kunde inte hämta status');

        const scanData: ScanResultData = await res.json();

        if (cancelled) return;

        setData(scanData);
        setLoading(false);

        if (scanData.status === 'pending' || scanData.status === 'running') {
          pollRef.current = setTimeout(poll, 2000);
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
          setNotFound(true);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [id]);

  useEffect(() => {
    if (data?.status === 'completed') {
      document.title = 'Din hemsideskoll | Ottoniq';
      const robots = document.querySelector('meta[name="robots"]');
      if (!robots) {
        const m = document.createElement('meta');
        m.name = 'robots';
        m.content = 'noindex';
        document.head.appendChild(m);
      } else {
        robots.setAttribute('content', 'noindex');
      }
    }
  }, [data?.status]);

  if (loading) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </section>
    );
  }

  if (notFound || !data) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-sans text-3xl font-light text-text mb-4">
            Kollen hittades inte
          </h1>
          <p className="text-text-muted mb-8">
            Den här kollen finns inte eller har gått ut. Du kan göra en ny koll när som helst.
          </p>
          <Link to="/scan" className="btn-accent inline-flex items-center gap-2 px-6 py-3">
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till kollen
          </Link>
        </div>
      </section>
    );
  }

  if (data.status === 'failed') {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-14 h-14 mb-6 border border-amber-500/30">
            <AlertCircle className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="font-sans text-3xl font-light text-text mb-4">
            Kollen kunde inte slutföras
          </h1>
          <p className="text-text-muted mb-8">
            {data.error || 'Något gick fel när sidan analyserades.'}
          </p>
          <Link to="/scan" className="btn-accent inline-flex items-center gap-2 px-6 py-3">
            <RotateCw className="w-4 h-4" />
            Försök igen
          </Link>
        </div>
      </section>
    );
  }

  if (data.status === 'pending' || data.status === 'running') {
    return <ProgressView step={data.step} />;
  }

  // Completed — show results
  const result = data.result;
  if (!result) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-sans text-3xl font-light text-text mb-4">
            Något blev fel med resultaten
          </h1>
          <Link to="/scan" className="btn-accent inline-flex items-center gap-2 px-6 py-3">
            <RotateCw className="w-4 h-4" />
            Gör en ny koll
          </Link>
        </div>
      </section>
    );
  }

  const assessment = result.assessment;
  const goodAreas = assessment?.areas?.filter((a) => a.status === 'bra') || [];
  const improveAreas = assessment?.areas?.filter((a) => a.status === 'kan_forbattras') || [];
  const gp = result.googleProfile;

  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-border-subtle text-xs text-text-muted">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
            Kollen är klar
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl font-light text-text mb-3 leading-tight">
            Här är din hemsideskoll
          </h1>
          <p className="text-text-muted text-base">
            {result.hostname}
            {result.companyName ? ` — ${result.companyName}` : ''}
          </p>
        </div>

        {/* Overall summary */}
        {assessment?.overallSummary && (
          <div className="bg-bg-elev border border-border-subtle p-6 sm:p-8 mb-10 text-center">
            <p className="text-text text-lg leading-relaxed max-w-2xl mx-auto">
              {assessment.overallSummary}
            </p>
          </div>
        )}

        {/* Phone screenshot */}
        {result.screenshots.mobile && (
          <div className="mb-12">
            <h2 className="font-sans text-xl font-light text-text text-center mb-6">
              Så här ser din sida ut på mobil
            </h2>
            <PhoneFrame
              screenshot={result.screenshots.mobile}
              hostname={result.hostname}
            />
          </div>
        )}

        {/* Area cards */}
        {assessment?.areas && assessment.areas.length > 0 && (
          <div className="mb-12">
            <h2 className="font-sans text-2xl font-light text-text mb-6">
              Hur din hemsida mår
            </h2>

            {goodAreas.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-accent mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Det här fungerar bra
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goodAreas.map((area) => (
                    <AreaCard key={area.id} area={area} />
                  ))}
                </div>
              </div>
            )}

            {improveAreas.length > 0 && (
              <div>
                <h3 className="text-sm text-amber-400 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Kan förbättras
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {improveAreas.map((area) => (
                    <AreaCard key={area.id} area={area} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Google visibility quick facts */}
        <div className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-border-subtle p-5 text-center">
            <Search className="w-5 h-5 text-text-muted mx-auto mb-2" />
            <p className="text-xs text-text-dim mb-1">Google-profil</p>
            <p className="text-sm text-text">
              {gp?.google_profil_hittad
                ? `Syns${gp.knowledge_graph.rating ? ` (${gp.knowledge_graph.rating}★)` : gp.local_results.rating ? ` (${gp.local_results.rating}★)` : ''}`
                : 'Syns inte'}
            </p>
          </div>
          <div className="border border-border-subtle p-5 text-center">
            <Globe className="w-5 h-5 text-text-muted mx-auto mb-2" />
            <p className="text-xs text-text-dim mb-1">Google-sök</p>
            <p className="text-sm text-text">
              {gp?.found_in_search
                ? `Hittad${gp.search_position ? ` på plats ${gp.search_position}` : ''}`
                : 'Hittades inte'}
            </p>
          </div>
          <div className="border border-border-subtle p-5 text-center">
            <Gauge className="w-5 h-5 text-text-muted mx-auto mb-2" />
            <p className="text-xs text-text-dim mb-1">Laddtid (mobil)</p>
            <p className="text-sm text-text">
              {result.pageSpeed.lcp !== null
                ? `${(result.pageSpeed.lcp / 1000).toFixed(1)}s LCP`
                : 'Ej mätt'}
            </p>
          </div>
        </div>

        {/* Google profile details */}
        {gp?.google_profil_hittad && (
          <div className="mb-12 border border-border-subtle p-6">
            <h3 className="font-sans text-lg font-light text-text mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-accent" />
              Din Google-profil
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gp.knowledge_graph.exists && (
                <div className="text-sm text-text-muted space-y-1">
                  <p className="text-text-dim text-xs mb-1">Sidopanel (Knowledge Graph)</p>
                  {gp.knowledge_graph.title && <p>Namn: {gp.knowledge_graph.title}</p>}
                  {gp.knowledge_graph.rating && (
                    <p>Betyg: {gp.knowledge_graph.rating}{gp.knowledge_graph.review_count ? ` (${gp.knowledge_graph.review_count} recensioner)` : ''}</p>
                  )}
                  <p>Öppettider: {gp.knowledge_graph.has_hours ? 'Finns' : 'Saknas'}</p>
                  <p>Webbadress matchar: {gp.knowledge_graph.website_matches ? 'Ja' : 'Nej'}</p>
                </div>
              )}
              {gp.local_results.exists && (
                <div className="text-sm text-text-muted space-y-1">
                  <p className="text-text-dim text-xs mb-1">Kartresultat (Local Results)</p>
                  {gp.local_results.rating && (
                    <p>Betyg: {gp.local_results.rating}{gp.local_results.reviews ? ` (${gp.local_results.reviews} recensioner)` : ''}</p>
                  )}
                  {gp.local_results.position && <p>Position: {gp.local_results.position}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Improvements */}
        {assessment?.improvements && assessment.improvements.length > 0 && (
          <div className="mb-12">
            <h2 className="font-sans text-2xl font-light text-text mb-6">
              Konkreta förbättringar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.improvements.map((imp, i) => (
                <ImprovementCard key={imp.id} imp={imp} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="border border-border-subtle bg-bg-elev p-8 sm:p-10 text-center">
          <h2 className="font-sans text-2xl font-light text-text mb-4">
            Vill du ha hjälp att fixa det här?
          </h2>
          <p className="text-text-muted mb-8 max-w-lg mx-auto">
            Jag bygger och fixar hemsidor för småföretag i Bohuslän. Ring mig eller
            skicka en förfrågan så hör jag av mig.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+46700000000"
              className="btn-accent inline-flex items-center justify-center gap-2 px-6 py-3.5"
            >
              <Phone className="w-4 h-4" />
              Ring mig
            </a>
            <Link
              to="/demo"
              className="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3.5"
            >
              Skicka en förfrågan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* New scan link */}
        <div className="text-center mt-10">
          <Link
            to="/scan"
            className="text-text-muted hover:text-text transition-colors text-sm inline-flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Kolla en annan hemsida
          </Link>
        </div>
      </div>
    </section>
  );
}
