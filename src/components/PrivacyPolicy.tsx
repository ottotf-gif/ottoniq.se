import { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Integritetspolicy | Ottoniq';
  }, []);

  return (
    <section className="relative py-28 sm:py-40 bg-cream paper-grain min-h-screen">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-16 fade-in is-visible">
          <span className="eyebrow text-ink/50">Juridiskt</span>
          <h1 className="font-serif text-[clamp(2.25rem,5.5vw,4rem)] font-light leading-[1.02] text-ink tracking-tight mt-4">
            Integritetspolicy
          </h1>
          <p className="text-sm text-ink/45 mt-4">Senast uppdaterad: juli 2026</p>
        </div>

        <div className="space-y-12 fade-in is-visible">
          <div>
            <h2 className="font-serif text-2xl text-ink mb-4">Allmänt</h2>
            <p className="text-ink/75 leading-relaxed">
              Ottoniq ("jag") behandlar personuppgifter i enlighet med dataskyddsförordningen (GDPR).
              Denna policy beskriver vilka uppgifter jag samlar in, varför, och vilka rättigheter du har.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-4">Vilka uppgifter samlas in</h2>
            <p className="text-ink/75 leading-relaxed">
              Via kontaktformuläret på hemsidan samlas in: namn, e-postadress och meddelande.
              Uppgifterna lämnas frivilligt av dig när du skickar ett meddelande.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-4">Syfte och laglig grund</h2>
            <p className="text-ink/75 leading-relaxed">
              Uppgifterna används endast för att besvara din förfrågan. Den lagliga grunden är
              ditt samtycke, vilket du ger genom att skicka formuläret (artikel 6.1.a GDPR).
              Uppgifterna lagras inte längre än vad som behövs för att hantera din förfrågan,
              normalt högst 12 månader.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-4">Lagring och vidarebefordran</h2>
            <p className="text-ink/75 leading-relaxed">
              Dina uppgifter delas inte med tredje part. Formulärdata lagras i en säker databas
              som drivs av Supabase (EU-baserad infrastruktur) och skickas inte vidare till
              någon extern tjänst. Uppgifterna används enbart för att besvara din förfrågan.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-4">Dina rättigheter</h2>
            <p className="text-ink/75 leading-relaxed mb-3">
              Enligt GDPR har du rätt till:
            </p>
            <ul className="text-ink/75 leading-relaxed space-y-1 list-disc pl-5">
              <li>Insyn i vilka uppgifter som behandlas om dig</li>
              <li>Rättelse av felaktiga uppgifter</li>
              <li>Radering av dina uppgifter</li>
              <li>Begränsning av behandling</li>
              <li>Dataportabilitet</li>
              <li>Att återkalla ditt samtycke när som helst</li>
              <li>Att klaga till Integritetsskyddsmyndigheten (IMY)</li>
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink mb-4">Kontaktuppgifter</h2>
            <p className="text-ink/75 leading-relaxed">
              För att utöva dina rättigheter eller om du har frågor om hur dina uppgifter
              behandlas, kontakta mig på{' '}
              <a href="mailto:ottoniq.se@gmail.com" className="link-underline text-ink">
                ottoniq.se@gmail.com
              </a>.
            </p>
          </div>
        </div>

        <div className="mt-20 border-t border-ink/15 pt-8">
          <a
            href="/"
            className="text-sm text-ink/60 hover:text-ink transition-colors"
          >
            <span className="link-underline">← Tillbaka till hemsidan</span>
          </a>
        </div>
      </div>
    </section>
  );
}