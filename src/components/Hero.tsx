import { Phone } from 'lucide-react';

export default function Hero() {
  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="top"
      className="relative min-h-[100svh] flex items-center pt-24 pb-16 bg-bg"
      aria-label="Introduktion"
    >
      <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div className="fade-in">
            <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.1] text-text tracking-tight text-balance mb-6">
              Hemsidor för småföretag i Stenungsund och Bohuslän
            </h1>
            <p className="text-[17px] sm:text-[18px] text-text-muted leading-[1.65] text-pretty max-w-lg mb-8">
              Jag heter Otto och bygger hemsidor åt lokala företag. Det kostar 3 000 kr om året, och då ingår allt: bygget, domän, hosting och ändringar när du behöver dem. Du behöver inte kunna något om hemsidor.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="tel:+46704223887"
                className="btn-accent"
                aria-label="Ring Otto på 070-422 38 87"
              >
                <Phone className="w-4 h-4" />
                Ring mig – 070-422 38 87
              </a>
              <button
                onClick={scrollToContact}
                className="btn-ghost"
                aria-label="Gå till kontaktformulär"
              >
                Skicka en förfrågan
              </button>
            </div>
          </div>

          {/* Photo */}
          <div className="fade-in lg:order-last">
            <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] overflow-hidden bg-bg-card max-w-sm lg:max-w-none mx-auto">
              <img
                src="/otto.jpeg"
                alt="Otto, Ottoniq"
                className="w-full h-full object-cover"
                width="480"
                height="600"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
