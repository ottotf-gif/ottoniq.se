export default function Intro() {
  return (
    <section id="om" className="relative py-28 sm:py-40 bg-bg noise">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-12 fade-in">
          <span className="section-label">N° 02 — Ottoniq</span>
        </div>

        <div className="grid grid-cols-12 gap-y-12 gap-x-8">
          <div className="col-span-12 lg:col-span-8 fade-in">
            <p className="font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-[1.25] text-text tracking-tight text-pretty max-w-3xl">
              A website is often the first time someone meets your business.{' '}
              <span className="text-text-muted">
                Ottoniq builds websites designed to make that first interaction count.
              </span>
            </p>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9 fade-in space-y-6">
            <p className="text-sm text-text-muted leading-[1.7] max-w-xs">
              No templates. No themes. Every site is designed and built from scratch —
              tailored to how your business actually works and what your customers need to see.
            </p>
            <div className="hairline w-16 bg-accent" />
            <p className="text-sm text-text-dim leading-[1.7] max-w-xs">
              Based in Stenungsund. Working with businesses across Bohuslän and Sweden.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
