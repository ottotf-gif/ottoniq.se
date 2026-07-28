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
    <section id="process" className="relative py-28 sm:py-40 bg-cream-deep/40">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="grid grid-cols-12 gap-y-6 mb-20 sm:mb-28 fade-in">
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
            <span className="eyebrow text-ink/50">N° 03</span>
            <span className="eyebrow text-ink/50">Process</span>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h2 className="font-serif text-[clamp(2.25rem,5.5vw,5rem)] font-light leading-[1.02] text-ink tracking-tight max-w-3xl text-balance">
              Fyra steg, <span className="font-serif-italic text-gold">utan strul.</span>
            </h2>
          </div>
        </div>

        {/* The list */}
        <div className="border-t border-ink/15">
          {steps.map((s) => (
            <div
              key={s.n}
              className="group grid grid-cols-12 gap-4 sm:gap-8 py-10 sm:py-14 border-b border-ink/15 items-baseline fade-in transition-colors duration-500 hover:bg-cream/60"
            >
              <div className="col-span-2 sm:col-span-1">
                <span className="font-serif text-3xl sm:text-4xl font-light text-gold leading-none">
                  {s.n}
                </span>
              </div>
              <div className="col-span-10 sm:col-span-4">
                <h3 className="font-serif text-3xl sm:text-4xl font-light text-ink leading-none tracking-tight">
                  {s.title}
                </h3>
              </div>
              <div className="col-span-12 sm:col-span-7">
                <p className="text-base sm:text-lg text-ink/70 leading-[1.5] max-w-xl text-pretty sm:relative sm:-top-1">
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