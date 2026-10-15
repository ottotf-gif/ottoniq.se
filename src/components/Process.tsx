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
              className="grid grid-cols-12 gap-4 sm:gap-8 py-8 sm:py-10 border-b border-border-subtle items-baseline fade-in"
            >
              <div className="col-span-2 sm:col-span-1">
                <span className="text-2xl font-bold text-accent">{s.n}</span>
              </div>
              <div className="col-span-10 sm:col-span-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-text">
                  {s.title}
                </h3>
              </div>
              <div className="col-span-12 sm:col-span-7 sm:col-start-6">
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
