import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[92svh] flex items-center pt-32 pb-20 paper-grain bg-cream"
    >
      <div className="relative max-w-[1400px] mx-auto w-full px-6 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          <span className="eyebrow text-ink/50 block mb-6">
            Webbutveckling — Stenungsund & Bohuslän
          </span>

          <h1 className="font-serif text-[clamp(2.4rem,6.5vw,5.5rem)] font-light leading-[1.02] text-ink tracking-tight text-balance mb-8">
            Hemsidor som <span className="font-serif-italic text-gold">gör</span> skillnad för ditt företag.
          </h1>

          <p className="text-lg sm:text-xl text-ink/70 leading-[1.55] text-pretty max-w-xl mb-12">
            Jag bygger genomtänkta hemsidor som syns på Google och ger ett
            starkt första intryck — designade från grunden, inte från mallar.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/demo"
              className="group inline-flex items-center gap-3 px-7 py-4 bg-ink text-cream text-[14px] tracking-wide hover:bg-navy transition-colors duration-300"
            >
              Begär demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
            <a
              href="#kontakt"
              className="group inline-flex items-center gap-3 text-base text-ink"
            >
              <span className="link-underline">Kontakta mig</span>
            </a>
          </div>
        </div>

        <div className="absolute left-6 sm:left-10 lg:left-16 right-6 sm:right-10 lg:right-16 bottom-0 flex items-center justify-between text-[11px] tracking-[0.22em] uppercase text-ink/40 pb-6 pointer-events-none">
          <span>Designad från grunden</span>
          <span className="hidden sm:inline">SEO-optimerad</span>
          <span>Mobilanpassad</span>
        </div>
      </div>
    </section>
  );
}
