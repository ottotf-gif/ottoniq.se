export default function Footer() {
  return (
    <footer className="relative bg-cream border-t border-ink/15">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
        <div className="grid grid-cols-12 gap-y-10 gap-x-8 items-start">
          <div className="col-span-12 lg:col-span-7">
            <p className="font-serif-italic text-4xl sm:text-5xl text-ink leading-[1.05] tracking-tight max-w-xl text-balance">
              Bygger lugnt,<br />från Bohuslän.
            </p>
          </div>

          <div className="col-span-6 lg:col-span-2 lg:pt-2">
            <div className="eyebrow text-ink/45 mb-3">Kontakt</div>
            <a
              href="mailto:ottoniq.se@gmail.com"
              className="block text-sm text-ink/80 hover:text-ink transition-colors"
            >
              ottoniq.se@gmail.com
            </a>
          </div>

          <div className="col-span-6 lg:col-span-3 lg:pt-2">
            <div className="eyebrow text-ink/45 mb-3">Plats</div>
            <div className="text-sm text-ink/80">Stenungsund</div>
            <div className="text-sm text-ink/80">Bohuslän, Sverige</div>
          </div>
        </div>

        <div className="hairline mt-16 mb-6" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px] text-ink/55">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Ottoniq"
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-4 tracking-wide">
            <a
              href="/privacypolicy"
              className="text-[12px] text-ink/55 hover:text-ink transition-colors"
            >
              <span className="link-underline">Integritetspolicy</span>
            </a>
            <span className="text-ink/25">·</span>
            <span>© 2026 Ottoniq — Stenungsund</span>
          </div>
        </div>
      </div>
    </footer>
  );
}