import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface ProjectData {
  slug: string;
  name: string;
  title: string;
  metaDescription: string;
  image: string;
  imageAlt: string;
  url: string;
  urlLabel: string;
  year: string;
  description: string[];
  what: string[];
}

const projects: Record<string, ProjectData> = {
  odsmalsburgaren: {
    slug: 'odsmalsburgaren',
    name: 'Ödsmålsburgaren',
    title: 'Ödsmålsburgaren – Smashburgare i Stenungsund | Ottoniq',
    metaDescription: 'Hemsidan för Ödsmålsburgaren – smashburgare från en fast vagn vid Golv till Tak i Stenungsund. Designad och byggd av Ottoniq.',
    image: '/odsmalsburgaren.png',
    imageAlt: 'Skärmbild av Ödsmålsburgarens hemsida – smashburgare i Stenungsund',
    url: 'https://www.odsmalsburgaren.se',
    urlLabel: 'odsmalsburgaren.se',
    year: '2026',
    description: [
      'Ödsmålsburgaren säljer smashburgare från en fast vagn vid Golv till Tak i Stenungsund. De gör även catering och event.',
      'Ödsmålsburgaren hade en hemsida på plats, och vi är glada att ha publicerat den nya sajten. Den berättar om Jonas, vagnen på Golv till Tak och catering och event.',
    ],
    what: [
      'Hemsida designad från grunden',
      'Meny och information om catering',
      'Mobilvänlig och snabb',
      'Grundläggande sökmotoroptimering',
    ],
  },
  'maltes-stig': {
    slug: 'maltes-stig',
    name: 'Maltes Stig',
    title: 'Maltes Stig | Ottoniq',
    metaDescription: 'Hemsidan för Maltes Stig – designad och byggd av Ottoniq i Stenungsund.',
    image: '/maltesstig.png',
    imageAlt: 'Skärmbild av Maltes Stigs hemsida',
    url: 'https://maltesstig.com',
    urlLabel: 'maltesstig.com',
    year: '2026',
    description: [
      'Maltes Stig vid Saltkällan i Munkedal skapades av Malte Nytorpe. Etapp för etapp byggde han stigen runt Rödberget, med hjälp av företagare, privatpersoner och besökare.',
      'Stigen döptes till Maltes Stig år 2000 och sköts i dag ideellt av Intresseföreningen Maltes Stig. Den är ungefär 5 kilometer lång och besöks av omkring 30 000 personer varje år.',
    ],
    what: [
      'Hemsida designad från grunden',
      'Tydlig historia om stigen och Maltes arbete',
      'Information om längd, tillgänglighet och föreningen',
      'Mobilvänlig och snabb',
    ],
  },
};

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? projects[slug] : undefined;

  useEffect(() => {
    if (project) {
      document.title = project.title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', project.metaDescription);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute('href', `https://ottoniq.se/projekt/${project.slug}`);
    }
    window.scrollTo(0, 0);
  }, [project]);

  if (!project) {
    return (
      <section className="min-h-[80svh] flex items-center justify-center pt-24 pb-16 bg-bg">
        <div className="max-w-lg mx-auto px-5 text-center space-y-6">
          <h1 className="text-3xl font-bold text-text">Projektet hittades inte</h1>
          <Link to="/" className="inline-flex items-center gap-2 text-text-muted hover:text-text transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till startsidan
          </Link>
        </div>
      </section>
    );
  }

  return (
    <article className="min-h-screen pt-24 pb-20 bg-bg">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Back */}
        <div className="mb-10 fade-in">
          <Link
            to="/#projekt"
            className="inline-flex items-center gap-2 text-[15px] text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Alla projekt
          </Link>
        </div>

        {/* Header */}
        <header className="mb-10 fade-in">
          <p className="section-label mb-3">{project.year} · Live</p>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] text-text tracking-tight mb-4">
            {project.name}
          </h1>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[15px] text-accent hover:text-accent-dim transition-colors group"
            aria-label={`Besök ${project.name}s webbplats (öppnas i ny flik)`}
          >
            <span className="link-underline">{project.urlLabel}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </header>

        {/* Image */}
        <div className="mb-12 fade-in">
          <div className="overflow-hidden bg-bg-card border border-border-subtle">
            <img
              src={project.image}
              alt={project.imageAlt}
              className="w-full object-cover"
              width="1200"
              height="750"
              loading="eager"
            />
          </div>
        </div>

        {/* Description + what */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 fade-in">
          <div>
            <h2 className="text-xl font-semibold text-text mb-4">Om projektet</h2>
            <div className="space-y-4">
              {project.description.map((p, i) => (
                <p key={i} className="text-[17px] sm:text-[18px] text-text-muted leading-[1.65]">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text mb-4">Vad som byggdes</h2>
            <ul className="space-y-3">
              {project.what.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[17px] text-text-muted">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 pt-10 border-t border-border-subtle fade-in">
          <p className="text-[17px] sm:text-[18px] text-text-muted leading-[1.65] mb-6 max-w-lg">
            Vill du ha en liknande sajt? Hör av dig så pratar vi igenom vad du behöver.
          </p>
          <a href="tel:+46704223887" className="btn-accent">
            Ring mig
          </a>
        </div>
      </div>
    </article>
  );
}
