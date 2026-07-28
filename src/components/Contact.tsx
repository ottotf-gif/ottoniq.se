import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setStatus('done');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
        setErrorMsg('Något gick fel. Försök igen eller mejla mig direkt.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Något gick fel. Försök igen eller mejla mig direkt.');
    }
  };

  return (
    <section id="kontakt" className="relative py-28 sm:py-40 bg-cream paper-grain">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="grid grid-cols-12 gap-y-6 mb-20 sm:mb-24 fade-in">
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
            <span className="eyebrow text-ink/50">N° 06</span>
            <span className="eyebrow text-ink/50">Kontakt</span>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h2 className="font-serif text-[clamp(2.25rem,5.5vw,5rem)] font-light leading-[1.02] text-ink tracking-tight max-w-3xl text-balance">
              Berätta vad du <span className="font-serif-italic text-gold">behöver.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-y-12 gap-x-8 items-start">
          {/* Left column — contact info */}
          <div className="col-span-12 lg:col-span-4 fade-in space-y-10">
            <p className="font-serif text-2xl text-ink/85 leading-[1.45] tracking-tight">
              Jag hör av mig inom en dag.
            </p>
            <div className="space-y-5">
              <div>
                <div className="eyebrow text-ink/45 mb-2">Mejl</div>
                <a
                  href="mailto:ottoniq.se@gmail.com"
                  className="text-lg text-ink"
                >
                  <span className="link-underline">ottoniq.se@gmail.com</span>
                </a>
              </div>
              <div>
                <div className="eyebrow text-ink/45 mb-2">Plats</div>
                <div className="text-lg text-ink">Stenungsund, Bohuslän</div>
              </div>
            </div>
          </div>

          {/* Right column — form */}
          <div className="col-span-12 lg:col-span-7 lg:col-start-6 fade-in">
            {status === 'done' ? (
              <div className="border-t border-ink/15 pt-10">
                <p className="font-serif text-3xl sm:text-4xl text-ink leading-tight tracking-tight">
                  Tack — meddelandet är{' '}
                  <span className="font-serif-italic text-gold">mottaget.</span>
                </p>
                <p className="mt-6 text-ink/65 leading-relaxed max-w-md">
                  Jag hör av mig inom en dag.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-0">
                <label className="block group">
                  <div className="flex items-baseline justify-between border-t border-ink/15 pt-6 pb-2">
                    <span className="eyebrow text-ink/55">Namn</span>
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent text-2xl font-serif text-ink placeholder-ink/25 focus:outline-none pb-6 border-b border-transparent focus:border-ink/20 transition-colors"
                    placeholder="Ditt namn"
                  />
                </label>

                <label className="block group">
                  <div className="flex items-baseline justify-between border-t border-ink/15 pt-6 pb-2">
                    <span className="eyebrow text-ink/55">E-post</span>
                    <span className="eyebrow text-ink/30">Obligatoriskt</span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent text-2xl font-serif text-ink placeholder-ink/25 focus:outline-none pb-6 border-b border-transparent focus:border-ink/20 transition-colors"
                    placeholder="din@epost.se"
                  />
                </label>

                <label className="block group">
                  <div className="flex items-baseline justify-between border-t border-ink/15 pt-6 pb-2">
                    <span className="eyebrow text-ink/55">Meddelande</span>
                    <span className="eyebrow text-ink/30">Obligatoriskt</span>
                  </div>
                  <textarea
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-transparent text-xl font-serif text-ink placeholder-ink/25 focus:outline-none pb-6 resize-none border-b border-transparent focus:border-ink/20 transition-colors"
                    placeholder="Berätta lite om ditt företag."
                  />
                </label>

                <div className="border-t border-ink/15 pt-8">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="group inline-flex items-center gap-3 text-base text-ink disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Skickar…</span>
                      </>
                    ) : (
                      <>
                        <span className="link-underline">Skicka meddelande</span>
                        <span
                          aria-hidden
                          className="inline-block w-8 h-px bg-ink group-hover:w-12 transition-all duration-500"
                        />
                      </>
                    )}
                  </button>

                  {status === 'error' && (
                    <p className="mt-4 text-sm text-red-700/80">{errorMsg}</p>
                  )}
                </div>

                <p className="mt-14 text-sm text-ink/45 leading-relaxed max-w-md">
                  Genom att skicka samtycker du till att dina uppgifter behandlas för att
                  besvara din förfrågan. Du kan när som helst begära radering via{' '}
                  <a href="mailto:ottoniq.se@gmail.com" className="link-underline text-ink/65">
                    e-post
                  </a>. Se{' '}
                  <a
                    href="/privacypolicy"
                    className="link-underline text-ink/65"
                  >
                    integritetspolicyn
                  </a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}