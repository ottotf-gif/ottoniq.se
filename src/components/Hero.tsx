import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] flex flex-col justify-end pt-32 pb-12 noise bg-bg overflow-hidden"
    >
      {/* Accent line top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border-subtle" />

      {/* Subtle accent glow — single, controlled */}
      <div className="absolute top-1/4 right-[-10%] w-[40%] h-[50%] bg-accent/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto w-full px-6 sm:px-10 lg:px-16">
        {/* Eyebrow */}
        <div className="mb-8 fade-in">
          <span className="section-label">
            N° 01 — Digital Presence
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-[clamp(2.5rem,7vw,6rem)] font-light leading-[1.0] text-text tracking-tight text-balance mb-8 fade-in">
          Websites that make your business look{' '}
          <span className="font-serif-italic text-accent">as good</span>{' '}
          as it actually is.
        </h1>

        {/* Supporting + CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 items-end mb-16 fade-in">
          <p className="sm:col-span-6 text-base sm:text-lg text-text-muted leading-[1.55] text-pretty max-w-md">
            Ottoniq designs and builds fast, distinctive websites for ambitious local businesses.
          </p>
          <div className="sm:col-span-6 flex flex-wrap items-center gap-4 sm:justify-end">
            <a href="/demo" className="btn-accent group">
              Start a project
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
            <a href="/scan" className="btn-ghost group">
              Scan your website
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>

        {/* Bottom metadata strip */}
        <div className="flex items-center justify-between border-t border-border-subtle pt-6">
          <div className="flex items-center gap-8 sm:gap-12">
            <div>
              <div className="section-label mb-1">Based in</div>
              <div className="text-sm text-text-muted">Bohuslän, SE</div>
            </div>
            <div className="hidden sm:block">
              <div className="section-label mb-1">Focus</div>
              <div className="text-sm text-text-muted">Local business</div>
            </div>
            <div className="hidden lg:block">
              <div className="section-label mb-1">Since</div>
              <div className="text-sm text-text-muted">2024</div>
            </div>
          </div>
          <div className="text-right">
            <div className="section-label mb-1">Status</div>
            <div className="text-sm text-accent flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent rounded-full inline-block" />
              Accepting projects
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
