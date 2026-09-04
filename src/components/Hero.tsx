import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] flex items-end pt-32 pb-16 sm:pb-24 paper-grain bg-cream"
    >
      <div className="relative max-w-[1400px] mx-auto w-full px-6 sm:px-10 lg:px-16 grid grid-cols-12 gap-y-12 lg:gap-x-8 items-end">
        {/* Eyebrow with location */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
          <span className="eyebrow text-ink/50">Webbutveckling</span>
          <span className="eyebrow text-ink/50">Stenungsund & Bohuslän</span>
        </div>

        {/* The big statement */}
        <div className="col-span-12 lg:col-span-9 space-y-10">
          <h1 className="font-serif text-[clamp(2.6rem,8vw,7.5rem)] font-light leading-[0.95] text-ink tracking-tight">
            Hemsidor som <span className="font-serif-italic text-gold">gör</span><br className="hidden sm:inline" /> skillnad för ditt företag.
          </h1>

          <div className="grid sm:grid-cols-12 gap-6 sm:gap-10 max-w-4xl">
            <p className="sm:col-span-7 text-lg sm:text-xl text-ink/75 leading-[1.55] text-pretty">
              Jag bygger genomtänkta hemsidor som syns på Google och ger ett
              starkt första intryck — designade från grunden, inte från mallar.
            </p>
            <div className="sm:col-span-5 flex sm:justify-end items-end gap-4">
              <a
                href="/demo"
                className="group inline-flex items-center gap-3 px-6 py-3.5 bg-ink text-cream text-[14px] tracking-wide hover:bg-navy transition-colors duration-300"
              >
                Kom igång
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
              <a
                href="#kontakt"
                className="group inline-flex items-center gap-3 text-base text-ink"
              >
                <span className="link-underline">Kontakt</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-edge accent */}
      <div className="absolute left-6 sm:left-10 lg:left-16 right-6 sm:right-10 lg:right-16 bottom-0 flex items-center justify-between text-[11px] tracking-[0.22em] uppercase text-ink/40 pb-6 sm:pb-8 pointer-events-none">
        <span>Designad från grunden</span>
        <span className="hidden sm:inline">SEO-optimerad</span>
        <span>Mobilanpassad</span>
      </div>
    </section>
  );
}
