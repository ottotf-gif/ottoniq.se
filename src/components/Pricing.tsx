import { ArrowRight } from 'lucide-react';

const includes = [
  'Designad från grunden',
  'Mobilanpassad',
  'Snabb och SEO-optimerad',
  'Domän & hosting ingår',
  'Support när något händer',
  'Alltid uppdaterad',
];

export default function Pricing() {
  return (
    <section id="inkluderat" className="relative py-28 sm:py-40 bg-bg noise">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-20 sm:mb-24 fade-in">
          <span className="section-label mb-6 block">N° 06 — Included</span>
          <h2 className="font-serif text-[clamp(2.25rem,5.5vw,5rem)] font-light leading-[1.02] text-text tracking-tight max-w-3xl text-balance">
            En hemsida,{' '}
            <span className="font-serif-italic text-accent">allt ingår.</span>
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-y-16 gap-x-8 items-start">
          <div className="col-span-12 lg:col-span-7 fade-in">
            <p className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] text-text leading-[1.25] tracking-tight text-pretty max-w-xl font-light">
              Du får en hemsida som är klar att användas — byggd, lanserad
              och redo för dina kunder.
            </p>
            <div className="mt-8 hairline w-24 bg-accent" />
            <p className="mt-8 max-w-xl text-base sm:text-lg text-text-muted leading-[1.65] text-pretty">
              Jag sköter design, bygge, hosting och det tekniska — du behöver
              inte tänka på något av det. Hör av dig så går vi igenom vad ditt
              företag behöver.
            </p>
            <a href="/demo" className="btn-accent group mt-10">
              Berätta om ditt företag
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>

          <div className="col-span-12 lg:col-span-5 fade-in">
            <div className="border-t border-border-subtle">
              {includes.map((item) => (
                <div
                  key={item}
                  className="flex items-baseline gap-6 py-4 border-b border-border-subtle"
                >
                  <span className="text-accent text-sm w-6 shrink-0">—</span>
                  <span className="text-base text-text-muted leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
