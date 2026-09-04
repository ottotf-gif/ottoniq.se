import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="min-h-[80svh] flex items-center justify-center pt-32 pb-20 bg-cream paper-grain">
      <div className="max-w-xl mx-auto px-6 text-center space-y-8">
        <span className="eyebrow text-ink/40">404</span>
        <h1 className="font-serif text-[clamp(2.5rem,6vw,5rem)] font-light leading-[1.02] text-ink tracking-tight text-balance">
          Den här sidan finns <span className="font-serif-italic text-gold">inte.</span>
        </h1>
        <p className="text-base sm:text-lg text-ink/65 leading-[1.6] max-w-md mx-auto text-pretty">
          Sidan du letade efter har kanske flyttats eller tagits bort.
          Prova att gå till startsidan istället.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-3 px-7 py-4 bg-ink text-cream text-[14px] tracking-wide hover:bg-navy transition-colors duration-300"
        >
          Till startsidan
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
