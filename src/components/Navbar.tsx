import { ArrowRight } from 'lucide-react';

import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const contactHref = window.location.pathname === '/' ? '#kontakt' : '/#kontakt';

  const sectionLinks = [
    { id: 'arbete', label: 'Arbete' },
    { id: 'process', label: 'Process' },
    { id: 'om', label: 'Om' },
  ];

  function getSectionHref(id: string): string {
    if (window.location.pathname === '/') return `#${id}`;
    return `/#${id}`;
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-cream/95 backdrop-blur-md border-b border-ink/15 shadow-[0_1px_24px_rgba(20,25,42,0.04)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 sm:px-10 lg:px-16 py-5">
        <a
          href="/"
          className="flex items-center"
          aria-label="Ottoniq"
        >
          <img
            src="/logo.png"
            alt="Ottoniq"
            className="h-16 sm:h-20 w-auto object-contain"
          />
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {sectionLinks.map((l) => (
            <a
              key={l.id}
              href={getSectionHref(l.id)}
              className="text-[13px] text-ink/70 hover:text-ink transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/scan"
            className="text-[13px] text-ink/70 hover:text-ink transition-colors duration-300"
          >
            Hemsidecheck
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="/demo"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream text-[13px] tracking-wide hover:bg-navy transition-colors duration-300"
          >
            Begär demo
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <button
            className="md:hidden p-2 text-ink -mr-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-cream border-t border-ink/8">
          <nav className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col">
            {sectionLinks.map((l) => (
              <a
                key={l.id}
                href={getSectionHref(l.id)}
                onClick={() => setOpen(false)}
                className="text-base text-ink/80 hover:text-ink transition-colors py-3 border-b border-ink/8 last:border-b-0"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/scan"
              onClick={() => setOpen(false)}
              className="text-base text-ink/80 hover:text-ink transition-colors py-3 border-b border-ink/8"
            >
              Hemsidecheck
            </a>
            <a
              href="/demo"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 bg-ink text-cream text-[14px] tracking-wide"
            >
              Begär demo
              <ArrowRight className="w-4 h-4" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
