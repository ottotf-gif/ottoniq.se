import { useState, useRef, useEffect } from 'react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xzdwbzzk';

const KNOWLEDGE = `
OTTONIQ — fakta:
- Ottoniq drivs av Otto, en ung webbutvecklare från Stenungsund.
- Bygger hemsidor för lokala företag, designade från grunden, mobilanpassade och SEO-optimerade.
- Allt ingår: design, bygge, domän, hosting, support och löpande uppdateringar.
- Kan även koppla in bokningssystem direkt på hemsidan.
- Man kan få en kostnadsfri demo där Otto bygger en skiss på hur hemsidan skulle kunna se ut. Tar ca 20 minuter att gå igenom.
- Otto hör av sig inom en dag.
- Senaste projekt: hemsida för Maltes Stig (maltesstig.com), live nu.
- Process: 1) Samtal om vad du behöver  2) Otto designar och visar förslag  3) Bygger och justerar tills det känns rätt  4) Lansering tillsammans.
- Kontakt: ottoniq.se@gmail.com, telefon 070-422 38 87.
`;

const SYSTEM_PROMPT = `Du är Ottoniqs vänliga chattassistent på hemsidan ottoniq.se. Du hjälper besökare och ditt främsta mål är att boka in ett kostnadsfritt möte (demo) med Otto.

${KNOWLEDGE}

DITT UPPDRAG:
1. Svara vänligt och kort på frågor om Ottoniq och hemsidor (på svenska, max 3-4 meningar).
2. Sträva alltid mot att boka ett möte. När någon visar minsta intresse, föreslå en kostnadsfri demo.
3. För att boka behöver du samla in TRE saker: personens NAMN, deras EMAIL, och VAD de vill ha hjälp med (deras företag/behov). Fråga om en sak i taget, naturligt.
4. När du har namn + email + vad de vill ha, bekräfta uppgifterna och skriv EXAKT denna rad på en egen rad sist i ditt svar (användaren ser inte denna rad, den används för bokningen):
[[BOOKING]]{"name":"<namn>","email":"<email>","need":"<vad de vill ha>","time":"<önskad tid om angiven, annars 'flexibel'>"}[[/BOOKING]]
5. Nämn ALDRIG pris. Säg att Otto går igenom det personligen på mötet.
6. Om någon frågar om något helt orelaterat, svara vänligt att du helst pratar om hur Ottoniq kan hjälpa deras företag.

Var varm, personlig och inte säljig. Du representerar Otto.`;

function parseBooking(text: string): { clean: string; booking: Record<string, string> | null } {
  const match = text.match(/\[\[BOOKING\]\]([\s\S]*?)\[\[\/BOOKING\]\]/);
  if (!match) return { clean: text, booking: null };
  let booking: Record<string, string> | null = null;
  try {
    booking = JSON.parse(match[1].trim());
  } catch {
    booking = null;
  }
  const clean = text.replace(/\[\[BOOKING\]\][\s\S]*?\[\[\/BOOKING\]\]/, '').trim();
  return { clean, booking };
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hej! Jag hjälper dig gärna med frågor om Ottoniq — och kan boka in en kostnadsfri demo med Otto. Vad kan jag hjälpa dig med?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (open && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const submitBooking = async (b: Record<string, string>) => {
    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: b.name || '',
          email: b.email || '',
          message: `[CHATBOT-BOKNING] Vill ha hjälp med: ${b.need || '-'}. Önskad tid: ${b.time || 'flexibel'}.`,
          _subject: `Ny demo-bokning via chatten: ${b.name || 'okänd'}`,
        }),
      });
      setBooked(true);
    } catch {
      // silent
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');
    const next = [...messages, { role: 'user' as const, content: userText }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...next.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('OpenAI error:', res.status, errText);
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Hoppsan — jag kan inte svara just nu. Mejla gärna ottoniq.se@gmail.com så svarar Otto direkt!' }]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || '';
      const { clean, booking } = parseBooking(raw);
      setMessages((prev) => [...prev, { role: 'assistant', content: clean || 'Tack! Otto hör av sig snart.' }]);
      if (booking && booking.email) {
        await submitBooking(booking);
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Något gick fel med uppkopplingen. Mejla gärna ottoniq.se@gmail.com så svarar Otto direkt!' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Launcher button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Öppna chatt"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 50,
          height: 52,
          padding: open ? 0 : '0 22px',
          width: open ? 52 : 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#1B2E4B',
          color: '#F5F2EC',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontFamily: "'Inter Tight', system-ui, sans-serif",
          fontSize: 13,
          letterSpacing: '0.02em',
          transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
          boxShadow: '0 6px 28px rgba(27,46,75,0.28)',
        }}
      >
        {open ? (
          <span style={{ margin: '0 auto', fontSize: 18, lineHeight: 1 }}>✕</span>
        ) : (
          <>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />
            Chatta med oss
          </>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="tg-chat-window"
          style={{
            position: 'fixed',
            zIndex: 50,
            background: '#F5F2EC',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(20,25,42,0.15)',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 24px 70px rgba(27,46,75,0.30)',
          }}
        >
          {/* Header — editorial style with eyebrow */}
          <div style={{ background: '#1B2E4B', padding: '20px 22px', position: 'relative' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.9)', marginBottom: 6 }}>
              Ottoniq — chatt
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontSize: 22, color: '#F5F2EC', lineHeight: 1 }}>
              Hur kan jag hjälpa dig?
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Stäng"
              style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: 'rgba(245,242,236,0.6)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="tg-chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(20,25,42,0.4)', marginBottom: 5, paddingLeft: m.role === 'user' ? 0 : 2, paddingRight: m.role === 'user' ? 2 : 0 }}>
                  {m.role === 'user' ? 'Du' : 'Ottoniq'}
                </div>
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '12px 16px',
                    fontSize: 14,
                    lineHeight: 1.6,
                    borderRadius: 4,
                    background: m.role === 'user' ? '#1B2E4B' : '#FFFFFF',
                    color: m.role === 'user' ? '#F5F2EC' : '#14192A',
                    border: m.role === 'user' ? 'none' : '1px solid rgba(20,25,42,0.1)',
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {booked && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ borderLeft: '2px solid #C9A84C', paddingLeft: 14, paddingTop: 2, paddingBottom: 2 }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 3 }}>Skickat</div>
                  <div style={{ fontSize: 13, color: '#1B2E4B', lineHeight: 1.5 }}>Din förfrågan är skickad till Otto — han hör av sig inom en dag.</div>
                </div>
              </div>
            )}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(20,25,42,0.4)', marginBottom: 5, paddingLeft: 2 }}>Ottoniq</div>
                <div style={{ background: '#FFFFFF', border: '1px solid rgba(20,25,42,0.1)', borderRadius: 4, padding: '14px 16px', display: 'flex', gap: 5 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(20,25,42,0.35)', animation: `chatbounce 1s ${i * 150}ms infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input — sharp, hairline divider */}
          <div style={{ borderTop: '1px solid rgba(20,25,42,0.12)', padding: 14, background: '#F5F2EC' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Skriv ett meddelande…"
                style={{ flex: 1, background: '#FFFFFF', border: '1px solid rgba(20,25,42,0.15)', borderRadius: 4, padding: '12px 14px', fontSize: 14, color: '#14192A', outline: 'none', fontFamily: "'Inter Tight', system-ui, sans-serif" }}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Skicka"
                style={{ padding: '0 18px', borderRadius: 4, background: '#C9A84C', color: '#1B2E4B', border: 'none', cursor: loading || !input.trim() ? 'default' : 'pointer', opacity: loading || !input.trim() ? 0.4 : 1, transition: 'opacity 0.2s', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}
              >
                Skicka
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatbounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .tg-chat-window {
          bottom: 90px;
          right: 24px;
          width: 400px;
          height: 540px;
          max-height: calc(100vh - 120px);
        }
        @media (max-width: 640px) {
          .tg-chat-window {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            border-radius: 0 !important;
            border: none !important;
          }
        }
      `}</style>
    </>
  );
}