import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative bg-bg-elev border-t border-border-subtle">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-10">
          {/* Brand */}
          <div>
            <img
              src="/logo.png"
              alt="Ottoniq"
              className="h-7 w-auto object-contain brightness-0 invert mb-4"
              width="70"
              height="28"
              loading="lazy"
            />
            <p className="text-[15px] text-text-muted leading-relaxed">
              Stenungsund, Bohuslän
            </p>
            <p className="text-[15px] text-text-muted mt-1">
              <a href="tel:+46704223887" className="hover:text-text transition-colors">
                070-422 38 87
              </a>
            </p>
            <p className="text-[15px] text-text-muted mt-1">
              <a href="mailto:otto@ottoniq.se" className="hover:text-text transition-colors">
                otto@ottoniq.se
              </a>
            </p>
          </div>

          {/* Länkar */}
          <div>
            <p className="section-label mb-4">Sidor</p>
            <nav aria-label="Sidfotnavigation" className="flex flex-col gap-3">
              <button
                onClick={() => document.getElementById('projekt')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[15px] text-text-muted hover:text-text transition-colors text-left"
              >
                Projekt
              </button>
              <a
                href="/scan"
                className="text-[15px] text-text-muted hover:text-text transition-colors"
              >
                Gratis hemsideskoll
              </a>
              <Link
                to="/integritetspolicy"
                className="text-[15px] text-text-muted hover:text-text transition-colors"
              >
                Integritetspolicy
              </Link>
            </nav>
          </div>

          {/* Kontakt */}
          <div>
            <p className="section-label mb-4">Kontakt</p>
            <a
              href="tel:+46704223887"
              className="block text-[15px] text-text-muted hover:text-text transition-colors mb-2"
              aria-label="Ring 070-422 38 87"
            >
              070-422 38 87
            </a>
            <a
              href="mailto:otto@ottoniq.se"
              className="block text-[15px] text-text-muted hover:text-text transition-colors"
            >
              otto@ottoniq.se
            </a>
          </div>
        </div>

        <div className="hairline mb-6" />

        <p className="text-[13px] text-text-dim">
          © 2026 Ottoniq · Stenungsund, Bohuslän
        </p>
      </div>
    </footer>
  );
}
