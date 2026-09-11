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
    <section className="relative py-28 sm:py-40 bg-bg noise">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-12 fade-in">
          <span className="section-label">N° 04 — Scan Tool</span>
        </div>

        <div className="grid grid-cols-12 gap-y-12 gap-x-8">
          <div className="col-span-12 lg:col-span-8 fade-in">
            <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] font-light leading-[1.0] text-text tracking-tight text-balance mb-6">
              Your website.{' '}
              <span className="font-serif-italic text-accent">Under the microscope.</span>
            </h2>
            <p className="text-base sm:text-lg text-text-muted leading-[1.55] max-w-lg text-pretty mb-10">
              See how your website performs across speed, mobile experience, SEO and first impression.
            </p>

            <form onSubmit={handleSubmit} className="max-w-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.se"
                  className="flex-1 px-5 py-4 bg-bg-elev border border-border text-text placeholder:text-text-dim text-[15px] focus:outline-none focus:border-accent transition-colors duration-300"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-accent text-bg text-[14px] font-medium hover:bg-accent-dim transition-colors duration-300 shrink-0"
                >
                  Analyse website
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9 fade-in">
            <div className="space-y-6">
              <div>
                <div className="section-label mb-2">What you get</div>
                <ul className="space-y-2 text-sm text-text-muted">
                  <li className="flex items-center gap-2">
                    <span className="text-accent">—</span> Performance score
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">—</span> Mobile experience
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">—</span> SEO analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">—</span> Security check
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">—</span> Screenshots
                  </li>
                </ul>
              </div>
              <div className="hairline w-16 bg-accent" />
              <p className="text-xs text-text-dim leading-[1.6]">
                Takes about 30 seconds. No signup required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
