import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative py-24 sm:py-32 bg-bg noise border-t border-border-subtle">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-2xl fade-in">
          <h2 className="font-serif text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] tracking-tight text-balance mb-8 text-text">
            Redo att sätta igång?{' '}
            <span className="font-serif-italic text-accent">Berätta om ditt företag.</span>
          </h2>
          <p className="text-base sm:text-lg text-text-muted leading-[1.6] max-w-lg mb-10 text-pretty">
            Svara på några snabba frågor så hör jag av mig med en plan för din hemsida.
          </p>
          <a href="/demo" className="btn-accent group">
            Start a project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>
      </div>
    </section>
  );
}
