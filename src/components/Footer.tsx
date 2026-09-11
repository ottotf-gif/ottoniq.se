export default function Footer() {
  return (
    <footer className="relative bg-bg border-t border-border-subtle noise">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
        <div className="grid grid-cols-12 gap-y-10 gap-x-8 items-start">
          <div className="col-span-12 lg:col-span-7">
            <p className="font-serif-italic text-4xl sm:text-5xl text-text leading-[1.05] tracking-tight max-w-xl text-balance font-light">
              Bygger lugnt,<br />från Bohuslän.
            </p>
          </div>

          <div className="col-span-6 lg:col-span-2 lg:pt-2">
            <div className="section-label mb-3">Kontakt</div>
            <a
              href="mailto:ottoniq.se@gmail.com"
              className="block text-sm text-text-muted hover:text-text transition-colors"
            >
              ottoniq.se@gmail.com
            </a>
          </div>

          <div className="col-span-6 lg:col-span-3 lg:pt-2">
            <div className="section-label mb-3">Plats</div>
            <div className="text-sm text-text-muted">Stenungsund</div>
            <div className="text-sm text-text-muted">Bohuslän, Sverige</div>
          </div>
        </div>

        <div className="hairline mt-16 mb-6" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px] text-text-dim">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Ottoniq"
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </div>
          <div className="flex items-center gap-4 tracking-wide">
            <a
              href="/privacypolicy"
              className="text-[12px] text-text-dim hover:text-text transition-colors"
            >
              <span className="link-underline">Integritetspolicy</span>
            </a>
            <span className="text-border">·</span>
            <span>© 2026 Ottoniq — Stenungsund</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
