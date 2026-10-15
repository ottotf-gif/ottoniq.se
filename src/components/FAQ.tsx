import { useState } from 'react';

const faqs: { q: string; a: string }[] = [
  {
    q: 'Vad kostar det?',
    a: '3 000 kr om året. Allt ingår: design, bygge, domän, hosting och ändringar.',
  },
  {
    q: 'Hur lång tid tar det?',
    a: 'Oftast 1–2 veckor från första samtalet tills sidan är live.',
  },
  {
    q: 'Vad behöver jag göra själv?',
    a: 'Berätta om ditt företag och skicka några bilder om du har. Resten fixar jag.',
  },
  {
    q: 'Kan jag ha bokning på hemsidan?',
    a: 'Ja, det går att lägga till.',
  },
  {
    q: 'Vad händer om jag vill sluta?',
    a: 'Du kan säga upp avtalet och behöver inte betala mer. Domänen äger du själv och kan flytta om du vill.',
  },
  {
    q: 'Jag har redan en hemsida, kan du göra om den?',
    a: 'Ja. Domänen kan vi oftast flytta med.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="fragor" className="relative py-20 sm:py-28 bg-bg-elev">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight text-text tracking-tight mb-12 sm:mb-16 fade-in">
          Vanliga frågor
        </h2>

        <div className="max-w-2xl border-t border-border-subtle">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border-subtle fade-in">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-start justify-between gap-6 py-6 text-left"
                aria-expanded={open === i}
                aria-controls={`faq-answer-${i}`}
              >
                <h3 className="text-[17px] sm:text-[18px] font-medium text-text leading-snug">
                  {faq.q}
                </h3>
                <span
                  className="text-accent text-2xl flex-shrink-0 leading-none mt-0.5 transition-transform duration-200"
                  aria-hidden="true"
                  style={{ transform: open === i ? 'rotate(45deg)' : 'none' }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div
                  id={`faq-answer-${i}`}
                  className="pb-6 text-[17px] sm:text-[18px] text-text-muted leading-[1.65]"
                >
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
