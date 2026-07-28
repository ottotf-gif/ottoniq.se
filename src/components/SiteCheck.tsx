import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function SiteCheck() {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const encoded = encodeURIComponent(url.trim());
    window.location.href = `/scan?url=${encoded}`;
  };

  return (
    <section className="relative py-20 sm:py-28 bg-cream">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-12 gap-y-8 lg:gap-x-8">
          {/* Label */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-2 fade-in">
            <span className="eyebrow text-ink/50">Gratis verktyg</span>
            <span className="eyebrow text-ink/50">30 sekunder</span>
          </div>

          {/* Content */}
          <div className="col-span-12 lg:col-span-8 fade-in">
            <h2 className="font-serif text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] text-ink tracking-tight text-balance mb-6">
              Gratis <span className="font-serif-italic text-gold">hemsidecheck</span>
            </h2>
            <p className="text-base sm:text-lg text-ink/70 leading-[1.6] max-w-2xl mb-10 text-pretty">
              Få en snabb analys av din nuvarande hemsida på under 30 sekunder.
              Jag kontrollerar bland annat prestanda, mobilvänlighet, SEO och första intryck.
            </p>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Ange din hemsidas adress"
                  className="w-full px-5 py-4 bg-white border border-ink/12 text-ink placeholder:text-ink/40 text-[15px] focus:outline-none focus:border-ink/30 transition-colors duration-300"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-ink text-cream text-[14px] tracking-wide hover:bg-navy transition-colors duration-300 shrink-0"
              >
                Analysera hemsida
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
