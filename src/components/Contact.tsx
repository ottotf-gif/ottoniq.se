import { useState } from 'react';
import { Phone, Mail, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabaseConfig';

export default function Contact() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [what, setWhat] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !what) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ name, email: contact, message: what }),
      });

      if (res.ok) {
        setStatus('done');
        setName('');
        setContact('');
        setWhat('');
      } else {
        setStatus('error');
        setErrorMsg('Något gick fel. Försök igen eller ring mig direkt.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Något gick fel. Försök igen eller ring mig direkt.');
    }
  };

  return (
    <section id="kontakt" className="relative py-20 sm:py-28 bg-bg">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left */}
          <div className="fade-in">
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight text-text tracking-tight mb-5">
              Hör av dig
            </h2>
            <p className="text-[17px] sm:text-[18px] text-text-muted leading-[1.65] mb-10">
              Ring eller skriv, så hör jag av mig inom en dag.
            </p>

            <div className="space-y-5">
              <a
                href="tel:+46704223887"
                className="flex items-center gap-3 text-[17px] sm:text-[18px] text-text hover:text-accent transition-colors"
                aria-label="Ring Otto på 070-422 38 87"
              >
                <Phone className="w-5 h-5 text-accent shrink-0" />
                070-422 38 87
              </a>
              <a
                href="mailto:ottoniq.se@gmail.com"
                className="flex items-center gap-3 text-[17px] sm:text-[18px] text-text hover:text-accent transition-colors"
                aria-label="Mejla Otto på ottoniq.se@gmail.com"
              >
                <Mail className="w-5 h-5 text-accent shrink-0" />
                ottoniq.se@gmail.com
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="fade-in">
            {status === 'done' ? (
              <div className="space-y-4 pt-4">
                <p className="text-[22px] font-semibold text-text">Tack – jag hör av mig inom en dag.</p>
                <p className="text-[17px] text-text-muted leading-[1.65]">
                  Vill du inte vänta?{' '}
                  <a href="tel:+46704223887" className="text-accent link-underline">Ring direkt</a>.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="contact-name" className="block section-label mb-2">
                      Namn
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ditt namn"
                      className="w-full bg-bg-card border border-border text-text text-[17px] px-4 py-3.5 placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-contact" className="block section-label mb-2">
                      Telefon eller mejl <span className="text-accent" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-contact"
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="070-000 00 00 eller din@mejl.se"
                      required
                      className="w-full bg-bg-card border border-border text-text text-[17px] px-4 py-3.5 placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-what" className="block section-label mb-2">
                      Vad gäller det? <span className="text-accent" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="contact-what"
                      value={what}
                      onChange={(e) => setWhat(e.target.value)}
                      placeholder="Berätta kort om ditt företag och vad du behöver."
                      required
                      rows={4}
                      className="w-full bg-bg-card border border-border text-text text-[17px] px-4 py-3.5 placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-accent w-full justify-center py-4 text-[16px] disabled:opacity-60"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Skickar…
                      </>
                    ) : (
                      'Skicka'
                    )}
                  </button>

                  {status === 'error' && (
                    <p role="alert" className="text-[15px] text-red-400">{errorMsg}</p>
                  )}

                  <p className="text-[13px] text-text-dim leading-relaxed">
                    Dina uppgifter används bara för att besvara din förfrågan. Se{' '}
                    <Link to="/integritetspolicy" className="link-underline hover:text-text-muted transition-colors">
                      integritetspolicyn
                    </Link>.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
