import { useEffect, useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/#projekt', label: 'Projekt' },
  { to: '/#sa-funkar-det', label: 'Så funkar det' },
  { to: '/#om-mig', label: 'Om mig' },
  { to: '/#fragor', label: 'Frågor' },
  { to: '/#kontakt', label: 'Kontakt' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (to: string) => {
    setOpen(false);
    if (to.startsWith('/#')) {
      const id = to.slice(2);
      if (location.pathname === '/') {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = to;
      }
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-400 ${
        scrolled
          ? 'bg-bg/95 backdrop-blur-md border-b border-border-subtle'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-10 py-4">
        <Link to="/" className="flex items-center" aria-label="Ottoniq – tillbaka till startsidan">
          <img
            src="/logo.png"
            alt="Ottoniq"
            className="h-8 w-auto object-contain brightness-0 invert"
            width="80"
            height="32"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Huvudnavigation">
          {navLinks.map((l) => (
            <button
              key={l.to}
              onClick={() => handleNav(l.to)}
              className="text-[14px] text-text-muted hover:text-text transition-colors duration-200"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:+46704223887"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-accent text-bg text-[14px] font-semibold hover:bg-accent-dim transition-colors duration-200"
            aria-label="Ring Otto på 070-422 38 87"
          >
            <Phone className="w-3.5 h-3.5" />
            Ring mig
          </a>
          <button
            className="md:hidden p-2 text-text -mr-1"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Stäng meny' : 'Öppna meny'}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-bg border-t border-border-subtle" role="navigation" aria-label="Mobilnavigation">
          <nav className="max-w-6xl mx-auto px-5 py-5 flex flex-col gap-0">
            {navLinks.map((l) => (
              <button
                key={l.to}
                onClick={() => handleNav(l.to)}
                className="text-left text-[17px] text-text-muted hover:text-text transition-colors py-3 border-b border-border-subtle"
              >
                {l.label}
              </button>
            ))}
            <a
              href="tel:+46704223887"
              className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-accent text-bg text-[15px] font-semibold"
              onClick={() => setOpen(false)}
            >
              <Phone className="w-4 h-4" />
              Ring mig – 070-422 38 87
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
