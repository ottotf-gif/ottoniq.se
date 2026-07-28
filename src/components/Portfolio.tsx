export default function Portfolio() {
  return (
    <section id="arbete" className="relative py-28 sm:py-40 bg-ink text-cream">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-12 gap-y-6 mb-20 sm:mb-28 fade-in">
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
            <span className="eyebrow text-cream/45">N° 05</span>
            <span className="eyebrow text-cream/45">Arbete</span>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h2 className="font-serif text-[clamp(2.25rem,5.5vw,5rem)] font-light leading-[1.02] tracking-tight max-w-3xl text-balance">
              Senaste <span className="font-serif-italic text-gold">projekt.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-y-10 gap-x-8 items-end fade-in">
          <div className="col-span-12 lg:col-span-8 lg:col-start-2">
            <a
              href="https://maltesstig.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block relative aspect-[16/10] overflow-hidden bg-cream/5 border border-cream/10 group"
            >
              <img
                src="/maltesstig.png"
                alt="Maltes Stig hemsida"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-500" />
              <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-3 py-1.5 border border-gold/50 text-gold text-[11px] tracking-[0.22em] uppercase">
                Live
              </div>
            </a>
          </div>

          <div className="col-span-12 lg:col-span-3 lg:col-start-10 space-y-6">
            <div>
              <span className="eyebrow text-cream/45">Projekt 01</span>
              <h3 className="mt-3 font-serif text-4xl sm:text-5xl font-light tracking-tight leading-[1.05]">
                Maltes Stig
              </h3>
            </div>
            <div className="hairline w-12 bg-gold" />
            <p className="text-cream/65 leading-[1.65]">
              Hemsida för ett lokalt företag — designad och byggd från grunden.
            </p>
            <div className="pt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="eyebrow text-cream/40 mb-1">År</div>
                <div className="text-cream">2026</div>
              </div>
              <div>
                <div className="eyebrow text-cream/40 mb-1">Status</div>
                <div className="text-cream">Live</div>
              </div>
            </div>
            <a
              href="https://maltesstig.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-sm text-cream/70 hover:text-gold transition-colors group"
            >
              <span className="link-underline">maltesstig.com</span>
              <span
                aria-hidden
                className="inline-block w-6 h-px bg-current group-hover:w-10 transition-all duration-500"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}