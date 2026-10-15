const includes = [
  'Hemsida designad för just ditt företag',
  'Fungerar bra i mobilen',
  'Domän och hosting',
  'Grundläggande Google-optimering',
  'Ändringar när du behöver dem – skicka ett sms eller mejl',
  'Jag fixar det tekniska, du behöver inte logga in någonstans',
];

export default function Pricing() {
  return (
    <section id="vad-ingar" className="relative py-20 sm:py-28 bg-bg">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight text-text tracking-tight mb-4 fade-in">
          Vad ingår
        </h2>
        <p className="text-[17px] sm:text-[18px] text-text-muted leading-[1.65] mb-12 sm:mb-16 fade-in max-w-xl">
          3 000 kr om året. Inga startavgifter, ingen bindningstid utöver året.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-0 border-t border-border-subtle fade-in">
          {includes.map((item) => (
            <div
              key={item}
              className="flex items-start gap-4 py-5 border-b border-border-subtle"
            >
              <span className="text-accent mt-1 shrink-0 text-lg font-bold">—</span>
              <p className="text-[17px] sm:text-[18px] text-text-muted leading-[1.55]">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
