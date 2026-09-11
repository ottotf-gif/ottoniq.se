const steps = [
  {
    n: '01',
    title: 'Samtal',
    body: 'Vi ses och pratar om vad du behöver.',
  },
  {
    n: '02',
    title: 'Skiss',
    body: 'Jag designar och visar dig förslag.',
  },
  {
    n: '03',
    title: 'Bygge',
    body: 'Jag bygger, vi stämmer av och justerar tills det känns rätt.',
  },
  {
    n: '04',
    title: 'Lansering',
    body: 'Vi lanserar tillsammans.',
  },
];

export default function Process() {
  return (
    <section id="process" className="relative py-28 sm:py-40 bg-bg-elev noise">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-20 sm:mb-28 fade-in">
          <span className="section-label mb-6 block">N° 05 — Process</span>
          <h2 className="font-serif text-[clamp(2.25rem,5.5vw,5rem)] font-light leading-[1.02] text-text tracking-tight max-w-3xl text-balance">
            Fyra steg,{' '}
            <span className="font-serif-italic text-accent">utan strul.</span>
          </h2>
        </div>

        <div className="border-t border-border-subtle">
          {steps.map((s) => (
            <div
              key={s.n}
              className="group grid grid-cols-12 gap-4 sm:gap-8 py-10 sm:py-14 border-b border-border-subtle items-baseline fade-in transition-colors duration-500 hover:bg-bg/40"
            >
              <div className="col-span-2 sm:col-span-1">
                <span className="font-serif text-3xl sm:text-4xl font-light text-accent leading-none">
                  {s.n}
                </span>
              </div>
              <div className="col-span-10 sm:col-span-4">
                <h3 className="font-serif text-3xl sm:text-4xl font-light text-text leading-none tracking-tight">
                  {s.title}
                </h3>
              </div>
              <div className="col-span-12 sm:col-span-7">
                <p className="text-base sm:text-lg text-text-muted leading-[1.5] max-w-xl text-pretty">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
