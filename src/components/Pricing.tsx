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
    <section id="pris" className="relative py-28 sm:py-40 bg-cream paper-grain">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="grid grid-cols-12 gap-y-6 mb-20 sm:mb-24 fade-in">
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
            <span className="eyebrow text-ink/50">N° 04</span>
            <span className="eyebrow text-ink/50">Vad ingår</span>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h2 className="font-serif text-[clamp(2.25rem,5.5vw,5rem)] font-light leading-[1.02] text-ink tracking-tight max-w-3xl text-balance">
              En hemsida, <span className="font-serif-italic text-gold">allt ingår.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-y-16 gap-x-8 items-start">
          <div className="col-span-12 lg:col-span-7 fade-in">
            <p className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] text-ink leading-[1.25] tracking-tight text-pretty max-w-xl">
              Du får en hemsida som är klar att användas — byggd, lanserad
              och redo för dina kunder.
            </p>
            <div className="mt-8 hairline w-24 bg-gold" />
            <p className="mt-8 max-w-xl text-base sm:text-lg text-ink/70 leading-[1.65] text-pretty">
              Inga uppstartskostnader. Jag sköter design, bygge, hosting och
              det tekniska — du behöver inte tänka på något av det. Hör av dig
              så går vi igenom vad ditt företag behöver.
            </p>
            <a
              href="#kontakt"
              className="inline-flex items-center gap-3 mt-10 text-base text-ink group"
            >
              <span className="link-underline">Boka ett samtal</span>
              <span
                aria-hidden
                className="inline-block w-8 h-px bg-ink group-hover:w-12 transition-all duration-500"
              />
            </a>
          </div>

          <div className="col-span-12 lg:col-span-5 fade-in">
            <div className="mb-8">
            <div className="flex items-baseline gap-2">
            <span className="font-serif text-[clamp(2rem,4vw,3rem)] font-light text-ink">3 000 kr</span>
            <span className="text-ink/50 text-base">/ år</span>
            </div>
            <p className="text-ink/60 text-sm mt-2">Fast pris. Inga dolda avgifter.</p>
            </div>
            <div className="border-t border-ink/15">
              {includes.map((item) => (
                <div
                  key={item}
                  className="flex items-baseline gap-6 py-4 border-b border-ink/15"
                >
                  <span className="font-serif-italic text-sm text-gold w-6 shrink-0">
                    ✦
                  </span>
                  <span className="text-base text-ink leading-snug">
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