import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Integritetspolicy | Ottoniq';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', 'Integritetspolicy för Ottoniq – så behandlar jag dina personuppgifter.');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', 'https://ottoniq.se/integritetspolicy');
  }, []);

  return (
    <section className="relative py-20 sm:py-28 bg-bg min-h-screen">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="mb-12 fade-in is-visible">
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-bold leading-tight text-text tracking-tight mt-4">
            Integritetspolicy
          </h1>
          <p className="text-[15px] text-text-dim mt-4">Senast uppdaterad: oktober 2026</p>
        </div>

        <div className="space-y-10 fade-in is-visible text-[17px] sm:text-[18px] text-text-muted leading-[1.65]">
          <div>
            <h2 className="text-xl font-semibold text-text mb-3">Allmänt</h2>
            <p>
              Ottoniq ("jag") behandlar personuppgifter i enlighet med dataskyddsförordningen (GDPR).
              Denna policy beskriver vilka uppgifter jag samlar in, varför, och vilka rättigheter du har.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-text mb-3">Vilka uppgifter samlas in</h2>
            <p>
              Via kontaktformuläret på hemsidan samlas in: namn, telefonnummer eller e-postadress, och meddelande.
              Uppgifterna lämnas frivilligt av dig när du skickar ett meddelande.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-text mb-3">Syfte och laglig grund</h2>
            <p>
              Uppgifterna används endast för att besvara din förfrågan. Den lagliga grunden är
              ditt samtycke, vilket du ger genom att skicka formuläret (artikel 6.1.a GDPR).
              Uppgifterna lagras inte längre än vad som behövs, normalt högst 12 månader.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-text mb-3">Lagring och vidarebefordran</h2>
            <p>
              Dina uppgifter delas inte med tredje part. Formulärdata lagras i en säker databas
              som drivs av Supabase (EU-baserad infrastruktur). Uppgifterna används enbart för att besvara din förfrågan.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-text mb-3">Dina rättigheter</h2>
            <p className="mb-3">Enligt GDPR har du rätt till:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Insyn i vilka uppgifter som behandlas om dig</li>
              <li>Rättelse av felaktiga uppgifter</li>
              <li>Radering av dina uppgifter</li>
              <li>Begränsning av behandling</li>
              <li>Att återkalla ditt samtycke när som helst</li>
              <li>Att klaga till Integritetsskyddsmyndigheten (IMY)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-text mb-3">Kontaktuppgifter</h2>
            <p>
              Kontakta mig på{' '}
              <a href="mailto:ottoniq.se@gmail.com" className="link-underline text-text hover:text-accent transition-colors">
                ottoniq.se@gmail.com
              </a>.
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-border-subtle pt-8">
          <Link to="/" className="text-[15px] text-text-muted hover:text-text transition-colors">
            <span className="link-underline">← Tillbaka till startsidan</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
