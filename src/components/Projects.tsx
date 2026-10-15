import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const projects = [
  {
    slug: 'odsmalsburgaren',
    name: 'Ödsmålsburgaren',
    image: '/odsmalsburgaren.png',
    imageAlt: 'Skärmbild av Ödsmålsburgarens hemsida',
    teaser: 'Ödsmålsburgaren hade en hemsida på plats, och vi är glada att ha publicerat den nya sajten. Läs mer om projektet och besök hemsidan.',
    url: 'https://www.odsmalsburgaren.se',
    urlLabel: 'odsmalsburgaren.se',
    year: '2026',
  },
  {
    slug: 'maltes-stig',
    name: 'Maltes Stig',
    image: '/maltesstig.png',
    imageAlt: 'Skärmbild av Maltes Stigs hemsida',
    teaser: 'Maltes Stig har nu en tydlig hemsida som berättar historien bakom stigen och gör det lättare för besökare att hitta information. Läs mer om projektet.',
    url: 'https://maltesstig.com',
    urlLabel: 'maltesstig.com',
    year: '2026',
  },
];

export default function Projects() {
  return (
    <section id="projekt" className="relative py-20 sm:py-28 bg-bg-elev">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight text-text tracking-tight mb-12 sm:mb-16 fade-in">
          Projekt
        </h2>

        <div className="space-y-16 sm:space-y-20">
          {projects.map((p, i) => (
            <article key={p.slug} className="fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Image */}
                <div className={`${i % 2 === 1 ? 'lg:order-last' : ''}`}>
                  <Link
                    to={`/projekt/${p.slug}`}
                    className="block relative overflow-hidden bg-bg-card border border-border-subtle group"
                    aria-label={`Läs mer om projektet ${p.name}`}
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.imageAlt}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        width="800"
                        height="500"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute top-4 left-4 px-2.5 py-1 bg-accent text-bg text-[11px] font-semibold tracking-wide uppercase">
                      Live
                    </div>
                  </Link>
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center gap-5">
                  <div>
                    <p className="section-label mb-2">{p.year} · Live</p>
                    <h3 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-text leading-tight tracking-tight">
                      {p.name}
                    </h3>
                  </div>
                  <p className="text-[17px] sm:text-[18px] text-text-muted leading-[1.65]">
                    {p.teaser}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      to={`/projekt/${p.slug}`}
                      className="inline-flex items-center gap-2 text-[15px] text-text hover:text-accent transition-colors group"
                      aria-label={`Läs mer om ${p.name}`}
                    >
                      <span className="link-underline">Läs mer</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[15px] text-text-muted hover:text-text transition-colors"
                      aria-label={`Besök ${p.name}s webbplats (öppnas i ny flik)`}
                    >
                      <span className="link-underline">{p.urlLabel}</span>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
