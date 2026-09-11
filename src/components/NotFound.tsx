import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="min-h-[80svh] flex items-center justify-center pt-32 pb-20 bg-bg noise">
      <div className="max-w-xl mx-auto px-6 text-center space-y-8">
        <span className="section-label">404</span>
        <h1 className="font-serif text-[clamp(2.5rem,6vw,5rem)] font-light leading-[1.02] text-text tracking-tight text-balance">
          Den här sidan finns{' '}
          <span className="font-serif-italic text-accent">inte.</span>
        </h1>
        <p className="text-base sm:text-lg text-text-muted leading-[1.6] max-w-md mx-auto text-pretty">
          Sidan du letade efter har kanske flyttats eller tagits bort.
          Prova att gå till startsidan istället.
        </p>
        <a href="/" className="btn-accent group">
          Till startsidan
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </a>
      </div>
    </section>
  );
}
