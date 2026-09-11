import { useState, useRef, useEffect } from 'react';

const styles = [
  {
    n: '01',
    name: 'BOLD',
    desc: 'Starka färger, tydliga kontraster. För företag som vill synas och höras.',
    bg: 'bg-[#1a1a2e]',
    accent: '#FF3D71',
    font: 'font-serif',
    preview: 'BOLD',
  },
  {
    n: '02',
    name: 'MINIMAL',
    desc: 'Rena ytor, lugn typografi. För företag som talar genom det de inte säger.',
    bg: 'bg-[#f5f5f0]',
    accent: '#2D2D2D',
    font: 'font-sans',
    preview: 'MINIMAL',
  },
  {
    n: '03',
    name: 'EDITORIAL',
    desc: 'Berättande layout, redaktionell känsla. För företag med en historia att dela.',
    bg: 'bg-[#2c1810]',
    accent: '#D4A574',
    font: 'font-serif',
    preview: 'EDITORIAL',
  },
  {
    n: '04',
    name: 'PREMIUM',
    desc: 'Mörk, exklusiv, detaljerad. För företag som säljer upplevelse, inte produkt.',
    bg: 'bg-[#0a0b0f]',
    accent: '#C6FF3D',
    font: 'font-sans',
    preview: 'PREMIUM',
  },
];

export default function StyleShowcase() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isTouch = useRef(false);

  useEffect(() => {
    isTouch.current = window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouch.current) return;
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const width = rect.width;
    const idx = Math.min(styles.length - 1, Math.floor((x / width) * styles.length));
    setActive(idx);
  };

  const current = styles[active];

  return (
    <section
      id="arbete"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative py-28 sm:py-40 bg-bg-elev noise overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-16 sm:mb-24 fade-in">
          <span className="section-label mb-6 block">N° 03 — Approach</span>
          <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] font-light leading-[1.05] text-text tracking-tight text-balance max-w-2xl">
            Different businesses.{' '}
            <span className="font-serif-italic text-accent">Different expressions.</span>
          </h2>
        </div>

        {/* Style preview area */}
        <div className="relative">
          {/* Stacked previews */}
          <div className="relative h-[400px] sm:h-[500px] mb-12 overflow-hidden">
            {styles.map((style, i) => {
              const offset = i - active;
              const isVisible = Math.abs(offset) <= 1;
              return (
                <div
                  key={style.n}
                  className={`absolute inset-0 transition-all duration-700 ${
                    isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  style={{
                    transform: `translateX(${offset * 60}%) scale(${1 - Math.abs(offset) * 0.05})`,
                    zIndex: styles.length - Math.abs(offset),
                    filter: offset === 0 ? 'none' : `brightness(${1 - Math.abs(offset) * 0.3})`,
                  }}
                >
                  <div className={`w-full h-full ${style.bg} flex items-center justify-center relative overflow-hidden`}>
                    {/* Style preview content */}
                    <div className="text-center relative z-10 px-8">
                      <div
                        className="text-[11px] font-medium tracking-[0.3em] uppercase mb-6"
                        style={{ color: style.accent }}
                      >
                        N° {style.n}
                      </div>
                      <div
                        className={`${style.font} text-[clamp(2.5rem,6vw,5rem)] font-light leading-none tracking-tight`}
                        style={{ color: style.bg === 'bg-[#f5f5f0]' ? '#2D2D2D' : '#fff' }}
                      >
                        {style.preview}
                      </div>
                      <div
                        className="mt-6 w-12 h-px mx-auto"
                        style={{ background: style.accent }}
                      />
                    </div>
                    {/* Decorative grid lines */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                      backgroundImage: `linear-gradient(${style.accent} 1px, transparent 1px), linear-gradient(90deg, ${style.accent} 1px, transparent 1px)`,
                      backgroundSize: '40px 40px',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active style info */}
          <div className="grid grid-cols-12 gap-4 sm:gap-8 fade-in">
            <div className="col-span-12 sm:col-span-4">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="font-serif text-3xl text-text-dim font-light">{current.n}</span>
                <h3 className="font-serif text-2xl sm:text-3xl text-text font-light tracking-tight">
                  {current.name}
                </h3>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-6">
              <p className="text-sm sm:text-base text-text-muted leading-[1.6] text-pretty">
                {current.desc}
              </p>
            </div>
            <div className="col-span-12 sm:col-span-2 sm:text-right">
              <div className="flex sm:justify-end gap-1.5">
                {styles.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`h-1 transition-all duration-300 ${
                      i === active ? 'w-8 bg-accent' : 'w-4 bg-border hover:bg-text-dim'
                    }`}
                    aria-label={`Style ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile swipe hint */}
          <p className="sm:hidden mt-6 text-xs text-text-dim text-center">
            Svep för att bläddra
          </p>
        </div>
      </div>
    </section>
  );
}
