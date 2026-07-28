export default function About() {
  return (
    <section id="om" className="relative py-24 sm:py-32 bg-cream">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section header */}
        <div className="grid grid-cols-12 gap-y-6 mb-14 sm:mb-20 fade-in">
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
            <span className="eyebrow text-ink/50">N° 02</span>
            <span className="eyebrow text-ink/50">Om mig</span>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h2 className="font-serif text-[clamp(2.25rem,5.2vw,4.5rem)] font-light leading-[1.05] text-ink tracking-tight max-w-4xl text-balance">
              En ung utvecklare med ett <span className="font-serif-italic text-gold">stort intresse</span> för design och kod.
            </h2>
          </div>
        </div>

        {/* Portrait + body — anchored together */}
        <div className="grid grid-cols-12 gap-y-10 gap-x-8 sm:gap-x-12 items-start">
          <div className="col-span-12 sm:col-span-7 lg:col-span-6 fade-in">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream-deep">
              <img
                src="/otto.jpeg"
                alt="Otto, webbutvecklare i Stenungsund"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-4 eyebrow text-ink/45">
              Otto — Stenungsund, 2026
            </p>
          </div>

          <div className="col-span-12 sm:col-span-5 lg:col-span-5 lg:col-start-8 space-y-7 fade-in lg:pt-6">
            <p className="font-serif text-2xl sm:text-[1.625rem] lg:text-3xl text-ink leading-[1.3] tracking-tight text-pretty">
              Jag heter Otto och bor i Stenungsund. Kod och design är det jag
              håller på med, och det jag är bäst på.
            </p>
            <div className="hairline w-12 bg-gold" />
            <p className="text-base lg:text-[1.0625rem] text-ink/70 leading-[1.65] text-pretty">
              Jag hjälper lokala företag att synas online. Du berättar vad du
              behöver, jag bygger en sida som passar ditt företag — och finns
              kvar när något ska ändras.
            </p>
            <div className="grid grid-cols-2 gap-6 text-sm pt-6 border-t border-ink/10">
              <div>
                <div className="eyebrow text-ink/45 mb-2">Bas</div>
                <div className="text-ink">Stenungsund</div>
              </div>
              <div>
                <div className="eyebrow text-ink/45 mb-2">Område</div>
                <div className="text-ink">Sverige</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}