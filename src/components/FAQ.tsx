import { useState } from 'react';

const faqs = [
  {
    q: 'Hur går det till?',
    a: 'Du berättar om ditt företag, jag designar och bygger sidan. Vi stämmer av under vägen, och när du är nöjd lanserar vi.',
  },
  {
    q: 'Hur lång tid tar det att bygga en hemsida?',
    a: 'Normalt 1–2 veckor från att vi pratat klart om vad du vill ha. Akuta projekt kan gå snabbare.',
  },
  {
    q: 'Vad ingår?',
    a: 'Allt. Design, kodning, domänuppsättning, hosting, mobilanpassning, SEO-grundoptimering och support.',
  },
  {
    q: 'Kan jag ha bokningssystem på hemsidan?',
    a: 'Ja. Jag kopplar bokning direkt på din hemsida så kunder kan boka tid utan att lämna sidan.',
  },
  {
    q: 'Behöver jag kunna något om hemsidor?',
    a: 'Nej. Du berättar vad du vill ha och jag bygger allt. Du behöver inte göra något tekniskt.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="relative py-24 sm:py-32 bg-bg-elev noise">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-16 fade-in">
          <span className="section-label mb-6 block">N° 08 — FAQ</span>
          <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-light leading-[1.05] text-text tracking-tight">
            Frågor om{' '}
            <span className="font-serif-italic text-accent">hemsida</span>
          </h2>
        </div>

        <div className="max-w-3xl ml-auto border-t border-border-subtle">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border-subtle fade-in">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-start justify-between gap-6 py-6 text-left"
                aria-expanded={open === i}
              >
                <span className="font-serif text-xl text-text leading-snug">
                  {faq.q}
                </span>
                <span
                  className="text-accent text-2xl flex-shrink-0 mt-0.5 transition-transform duration-300"
                  style={{ transform: open === i ? 'rotate(45deg)' : 'none' }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="pb-6 text-base text-text-muted leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
