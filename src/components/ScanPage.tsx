import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Loader2 } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function ScanPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [ort, setOrt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Skriv in en webbadress först.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/scan-website`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          url: url.trim(),
          companyName: companyName.trim() || undefined,
          ort: ort.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Kunde inte starta kollen.');
      }

      if (data.id) {
        navigate(`/scan/${data.id}`);
      } else if (data.status === 'completed' && data.result) {
        navigate(`/scan/${data.id}`);
      } else {
        throw new Error('Något gick fel. Försök igen.');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Kunde inte nå servern. Försök igen.'
      );
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-border-subtle text-xs text-text-muted">
            <Search className="w-3.5 h-3.5" />
            Gratis hemsideskoll
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl font-light text-text mb-4 leading-tight">
            Se hur din hemsida<br />ser ut för besökaren
          </h1>
          <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
            Skriv in din webbadress så kollar jag hur sidan upplevs,
            syns på Google och vad som kan bli bättre. Helt gratis.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-bg-elev border border-border-subtle p-6 sm:p-8"
        >
          <div>
            <label
              htmlFor="scan-url"
              className="block text-sm text-text-muted mb-2"
            >
              Webbadress *
            </label>
            <input
              id="scan-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="www.dinforetag.se"
              className="w-full bg-bg border border-border text-text px-4 py-3 text-base focus:outline-none focus:border-accent transition-colors"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="scan-company"
                className="block text-sm text-text-muted mb-2"
              >
                Företagsnamn
              </label>
              <input
                id="scan-company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ditt företag AB"
                className="w-full bg-bg border border-border text-text px-4 py-3 text-base focus:outline-none focus:border-accent transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="scan-ort"
                className="block text-sm text-text-muted mb-2"
              >
                Ort
              </label>
              <input
                id="scan-ort"
                type="text"
                value={ort}
                onChange={(e) => setOrt(e.target.value)}
                placeholder="Stenungsund"
                className="w-full bg-bg border border-border text-text px-4 py-3 text-base focus:outline-none focus:border-accent transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <p className="text-xs text-text-dim">
            Företagsnamn och ort hjälper till att kolla hur väl synligt ert företag
            är på Google. Valfritt men rekommenderas.
          </p>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="btn-accent w-full inline-flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Startar kollen...
              </>
            ) : (
              <>
                Kolla min hemsida
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-text-dim mt-6">
          Kollen tar cirka 30–60 sekunder. Inga uppgifter sparas om dig personligen.
        </p>
      </div>
    </section>
  );
}
