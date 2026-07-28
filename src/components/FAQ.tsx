import { useState } from 'react';

const faqs = [
  {
    q: 'Vad kostar en hemsida?',
    a: 'Allt ingår — design, hosting, support och uppdateringar. Inga uppstartskostnader och inga överraskningar. Hör av dig så går vi igenom vad som passar ditt företag.',
  },
  {
    q: 'Hur lång tid tar det att bygga en hemsida?',
    a: 'Normalt 1–2 veckor från att vi pratat klart om vad du vill ha. Akuta projekt kan gå snabbare.',
  },
  {
    q: 'Vad ingår i priset?',
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
    <section className="relative py-24 sm:py-32 bg-cream-deep/40">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-12 gap-y-6 mb-16 fade-in">
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
            <span className="eyebrow text-ink/50">Vanliga frågor</span>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-light leading-[1.05] text-ink tracking-tight">
              Frågor om{' '}
              <span className="font-serif-italic text-gold">hemsida</span>
            </h2>
          </div>
        </div>

        <div className="max-w-3xl ml-auto border-t border-ink/15">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-ink/15 fade-in">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-start justify-between gap-6 py-6 text-left"
                aria-expanded={open === i}
              >
                <span className="font-serif text-xl text-ink leading-snug">
                  {faq.q}
                </span>
                <span
                  className="text-gold text-2xl flex-shrink-0 mt-0.5 transition-transform duration-300"
                  style={{ transform: open === i ? 'rotate(45deg)' : 'none' }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="pb-6 text-base text-ink/70 leading-relaxed">
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