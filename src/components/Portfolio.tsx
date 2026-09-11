export default function Portfolio() {
  return (
    <section className="relative py-28 sm:py-40 bg-bg-elev noise">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-20 sm:mb-28 fade-in">
          <span className="section-label mb-6 block">N° 07 — Work</span>
          <h2 className="font-serif text-[clamp(2.25rem,5.5vw,5rem)] font-light leading-[1.02] text-text tracking-tight max-w-3xl text-balance">
            Senaste{' '}
            <span className="font-serif-italic text-accent">projekt.</span>
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-y-10 gap-x-8 items-end fade-in">
          <div className="col-span-12 lg:col-span-8 lg:col-start-2">
            <a
              href="https://maltesstig.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block relative aspect-[16/10] overflow-hidden bg-bg-card border border-border-subtle group"
            >
              <img
                src="/maltesstig.png"
                alt="Maltes Stig hemsida"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-bg/0 group-hover:bg-bg/20 transition-colors duration-500" />
              <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-3 py-1.5 border border-accent/50 text-accent text-[11px] tracking-[0.22em] uppercase">
                Live
              </div>
            </a>
          </div>

          <div className="col-span-12 lg:col-span-3 lg:col-start-10 space-y-6">
            <div>
              <span className="section-label">Projekt 01</span>
              <h3 className="mt-3 font-serif text-4xl sm:text-5xl font-light tracking-tight leading-[1.05] text-text">
                Maltes Stig
              </h3>
            </div>
            <div className="hairline w-12 bg-accent" />
            <p className="text-text-muted leading-[1.65]">
              Hemsida för ett lokalt företag — designad och byggd från grunden.
            </p>
            <div className="pt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="section-label mb-1">År</div>
                <div className="text-text">2026</div>
              </div>
              <div>
                <div className="section-label mb-1">Status</div>
                <div className="text-text">Live</div>
              </div>
            </div>
            <a
              href="https://maltesstig.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-sm text-text-muted hover:text-accent transition-colors group"
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
