const steps = [
  {
    n: '1.',
    title: 'Vi pratar',
    body: 'I telefon eller så ses vi. Du berättar om ditt företag.',
  },
  {
    n: '2.',
    title: 'Jag gör ett förslag',
    body: 'Du ser hur sidan ser ut innan du bestämmer dig.',
  },
  {
    n: '3.',
    title: 'Vi finslipar',
    body: 'Du säger vad som ska ändras.',
  },
  {
    n: '4.',
    title: 'Sidan går live',
    body: 'Och jag sköter den efter det.',
  },
];

export default function Process() {
  return (
    <section id="sa-funkar-det" className="relative py-20 sm:py-28 bg-bg-elev">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight text-text tracking-tight mb-12 sm:mb-16 fade-in">
          Så funkar det
        </h2>

        <div className="border-t border-border-subtle">
          {steps.map((s) => (
            <div
              key={s.n}
              className="grid grid-cols-1 sm:grid-cols-12 gap-x-8 gap-y-2 py-8 sm:py-10 border-b border-border-subtle sm:items-baseline fade-in"
            >
              <div className="sm:col-span-5 flex items-baseline gap-4">
                <span className="text-2xl font-bold text-accent shrink-0">{s.n}</span>
                <h3 className="text-xl sm:text-2xl font-semibold text-text">
                  {s.title}
                </h3>
              </div>
              <div className="sm:col-span-7">
                <p className="text-[17px] sm:text-[18px] text-text-muted leading-[1.65]">
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
