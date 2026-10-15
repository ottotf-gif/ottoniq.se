export default function About() {
  return (
    <section id="om-mig" className="relative py-20 sm:py-28 bg-bg">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Photo */}
          <div className="fade-in">
            <div className="relative aspect-[4/5] overflow-hidden bg-bg-card max-w-sm mx-auto lg:max-w-none">
              <img
                src="/otto.jpeg"
                alt="Otto, Ottoniq – Stenungsund"
                className="w-full h-full object-cover"
                width="480"
                height="600"
                loading="lazy"
              />
            </div>
          </div>

          {/* Text */}
          <div className="fade-in space-y-5">
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight text-text tracking-tight">
              Om mig
            </h2>
            <p className="text-[17px] sm:text-[18px] text-text-muted leading-[1.65] text-pretty">
              Jag är 15 år och bor i Stora Höga. Jag började bygga hemsidor för att många företag här runt omkring antingen saknar en, eller har en som inte har uppdaterats på flera år. Jag jobbar bara med företag i närheten, så vi kan ses om det behövs.
            </p>
            <div className="pt-2 grid grid-cols-2 gap-5 text-sm border-t border-border-subtle pt-5">
              <div>
                <p className="section-label mb-1">Plats</p>
                <p className="text-text">Stora Höga / Stenungsund</p>
              </div>
              <div>
                <p className="section-label mb-1">Jobbar med</p>
                <p className="text-text">Bohuslän och omnejd</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
