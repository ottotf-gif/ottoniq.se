import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative py-24 sm:py-32 bg-ink text-cream">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-2xl">
          <h2 className="font-serif text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] tracking-tight text-balance mb-8">
            Redo att sätta igång? <span className="font-serif-italic text-gold">Berätta om ditt företag.</span>
          </h2>
          <p className="text-base sm:text-lg text-cream/65 leading-[1.6] max-w-lg mb-10 text-pretty">
            Svara på några snabba frågor så hör jag av mig med en plan för din hemsida.
          </p>
          <a
            href="/demo"
            className="group inline-flex items-center gap-3 px-7 py-4 bg-cream text-ink text-[14px] tracking-wide hover:bg-gold hover:text-ink transition-colors duration-300"
          >
            Begär demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>
      </div>
    </section>
  );
}
