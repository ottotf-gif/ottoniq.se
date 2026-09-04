export default function Showcase() {
  return (
    <section className="relative py-20 sm:py-28 bg-cream">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-12 gap-y-8 lg:gap-x-8 mb-14 sm:mb-20 fade-in">
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
            <span className="eyebrow text-ink/50">Varför det spelar roll</span>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h2 className="font-serif text-[clamp(2rem,4.5vw,3.75rem)] font-light leading-[1.05] text-ink tracking-tight text-balance max-w-3xl">
              Din hemsida är ditt <span className="font-serif-italic text-gold">skyltfönster</span> på nätet.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 sm:gap-6 fade-in">
          <div className="col-span-12 sm:col-span-8 aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-cream-deep">
            <img
              src="https://images.pexels.com/photos/34029513/pexels-photo-34029513.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Lokal butik längs en svensk gata"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
          <div className="col-span-12 sm:col-span-4 aspect-[16/10] sm:aspect-auto overflow-hidden bg-cream-deep">
            <img
              src="https://images.pexels.com/photos/251225/pexels-photo-251225.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Modern arbetsplats med skärmar som visar webbdesign"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mt-12 sm:mt-16 fade-in">
          <div className="space-y-3">
            <span className="font-serif text-3xl sm:text-4xl font-light text-gold">01</span>
            <h3 className="font-serif text-xl text-ink tracking-tight">Första intrycket</h3>
            <p className="text-sm text-ink/65 leading-[1.65]">
              Besökare bildar sig en uppfattning om ditt företag på under tre sekunder.
              En genomtänkt hemsida gör att de stannar.
            </p>
          </div>
          <div className="space-y-3">
            <span className="font-serif text-3xl sm:text-4xl font-light text-gold">02</span>
            <h3 className="font-serif text-xl text-ink tracking-tight">Hittas på Google</h3>
            <p className="text-sm text-ink/65 leading-[1.65]">
              En tekniskt välbyggd sida rankar bättre. Jag optimerar varje sida
              för att dina kunder ska hitta dig.
            </p>
          </div>
          <div className="space-y-3">
            <span className="font-serif text-3xl sm:text-4xl font-light text-gold">03</span>
            <h3 className="font-serif text-xl text-ink tracking-tight">Fungerar på mobilen</h3>
            <p className="text-sm text-ink/65 leading-[1.65]">
              Över hälften av alla besök sker via telefonen. Varje sida jag bygger
              ser lika bra ut oavsett enhet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
