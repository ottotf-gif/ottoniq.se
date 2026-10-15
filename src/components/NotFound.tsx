import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="min-h-[80svh] flex items-center justify-center pt-24 pb-16 bg-bg">
      <div className="max-w-lg mx-auto px-5 text-center space-y-6">
        <p className="section-label">404</p>
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold text-text tracking-tight text-balance leading-tight">
          Den här sidan finns inte
        </h1>
        <p className="text-[17px] sm:text-[18px] text-text-muted leading-[1.65] max-w-sm mx-auto text-pretty">
          Sidan du letade efter har kanske flyttats eller tagits bort.
        </p>
        <Link to="/" className="btn-accent inline-flex">
          Till startsidan
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
