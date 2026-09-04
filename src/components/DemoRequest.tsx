import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, ArrowLeft, Camera, X, Loader2, CheckCircle2, AlertTriangle, Phone } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_KEY = 'ottoniq_demo_brief';
const TOTAL_STEPS = 8;

const MAL_OPTIONS = [
  { id: 'ringa', label: 'Ringa' },
  { id: 'boka', label: 'Boka tid' },
  { id: 'mejla', label: 'Mejla' },
  { id: 'hitta', label: 'Hitta hit' },
];

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

interface FormData {
  foretag: string;
  kontakt_namn: string;
  kontakt_mejl: string;
  mal: string[];
  tjanst1: string;
  tjanst2: string;
  tjanst3: string;
  omraden: string;
  vanligaste_fragan: string;
  ovrigt: string;
  referens_lank: string;
}

const emptyForm: FormData = {
  foretag: '',
  kontakt_namn: '',
  kontakt_mejl: '',
  mal: [],
  tjanst1: '',
  tjanst2: '',
  tjanst3: '',
  omraden: '',
  vanligaste_fragan: '',
  ovrigt: '',
  referens_lank: '',
};

function loadSavedData(): { step: number; data: FormData } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { step: parsed.step || 0, data: { ...emptyForm, ...parsed.data } };
    }
  } catch { /* ignore */ }
  return { step: 0, data: { ...emptyForm } };
}

function saveData(step: number, data: FormData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
}

function clearSavedData() {
  localStorage.removeItem(STORAGE_KEY);
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxW = 1600;
      let w = img.width;
      let h = img.height;
      if (w > maxW) {
        h = Math.round((h * maxW) / w);
        w = maxW;
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg',
        0.8
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image')); };
    img.src = url;
  });
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export default function DemoRequest() {
  const saved = useRef(loadSavedData());
  const [step, setStep] = useState(saved.current.step);
  const [form, setForm] = useState<FormData>(saved.current.data);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!done) saveData(step, form);
  }, [step, form, done]);

  const update = useCallback((patch: Partial<FormData>) => {
    setForm((f) => ({ ...f, ...patch }));
  }, []);

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return form.mal.length > 0;
      case 1: return form.foretag.trim() !== '';
      case 2: return form.kontakt_namn.trim() !== '' && form.kontakt_mejl.trim() !== '';
      case 3: return form.tjanst1.trim() !== '' && form.tjanst2.trim() !== '' && form.tjanst3.trim() !== '';
      case 4: return form.omraden.trim() !== '';
      case 5: return form.vanligaste_fragan.trim() !== '';
      case 6: return true;
      case 7: return true;
      default: return false;
    }
  };

  const toggleMal = (id: string) => {
    setForm((f) => {
      const next = f.mal.includes(id) ? f.mal.filter((m) => m !== id) : [...f.mal, id];
      return { ...f, mal: next };
    });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newImages: ImageFile[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const uploadImages = async (slug: string): Promise<string[]> => {
    const uploaded: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.status === 'done') {
        uploaded.push(img.file.name);
        continue;
      }

      setImages((prev) =>
        prev.map((im) => im.id === img.id ? { ...im, status: 'uploading' } : im)
      );

      try {
        const compressed = await compressImage(img.file);
        const filename = `${slug}/${Date.now()}-${img.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const res = await fetch(`${SUPABASE_URL}/storage/v1/object/brief-bilder/${filename}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'image/jpeg',
          },
          body: compressed,
        });

        if (res.ok) {
          uploaded.push(filename);
          setImages((prev) =>
            prev.map((im) => im.id === img.id ? { ...im, status: 'done' } : im)
          );
        } else {
          setImages((prev) =>
            prev.map((im) => im.id === img.id ? { ...im, status: 'error' } : im)
          );
        }
      } catch {
        setImages((prev) =>
          prev.map((im) => im.id === img.id ? { ...im, status: 'error' } : im)
        );
      }
    }
    return uploaded;
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const slug = generateSlug(form.foretag) || `brief-${Date.now()}`;
      const uploadedFiles = images.length > 0 ? await uploadImages(slug) : [];
      const tjanster = [form.tjanst1, form.tjanst2, form.tjanst3].filter(Boolean).join(' | ');

      const res = await fetch(`${SUPABASE_URL}/functions/v1/brief-notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          foretag: form.foretag,
          kontakt_namn: form.kontakt_namn,
          kontakt_mejl: form.kontakt_mejl,
          mal: form.mal.join(', '),
          tjanster,
          omraden: form.omraden,
          vanligaste_fragan: form.vanligaste_fragan,
          referens_lank: form.referens_lank || null,
          ovrigt: form.ovrigt || null,
          bilder: uploadedFiles,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Något gick fel. Försök igen.');
      }

      const data = await res.json();
      clearSavedData();
      setDeliveryDate(data.delivery_date || 'inom några dagar');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel. Försök igen.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="min-h-[80svh] flex items-center justify-center pt-32 pb-20 bg-cream paper-grain">
        <div className="max-w-lg mx-auto px-6 text-center space-y-8">
          <CheckCircle2 className="w-12 h-12 text-gold mx-auto" />
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.05] text-ink tracking-tight">
            Tack. Jag hör av mig senast <span className="font-serif-italic text-gold">{deliveryDate}.</span>
          </h1>
          <p className="text-sm text-ink/60 leading-[1.6]">
            En bekräftelse är på väg till din e-post. Har du frågor under tiden?
          </p>
          <a
            href="tel:+46704223887"
            className="inline-flex items-center gap-3 text-lg text-ink hover:text-gold transition-colors"
          >
            <Phone className="w-5 h-5" />
            <span className="link-underline">070-422 38 87</span>
          </a>
          <div className="pt-4">
            <a
              href="/"
              className="text-sm text-ink/60 hover:text-ink transition-colors"
            >
              <span className="link-underline">Till startsidan</span>
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[100svh] pt-28 sm:pt-36 pb-16 sm:pb-24 bg-cream paper-grain">
      <div className="max-w-xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <span className="eyebrow text-ink/40 mb-3 block">Ottoniq</span>
          <h1 className="font-serif text-[clamp(1.75rem,4.5vw,2.75rem)] font-light leading-[1.1] text-ink tracking-tight mb-4">
            Berätta om ditt <span className="font-serif-italic text-gold">företag.</span>
          </h1>
          <p className="text-sm text-ink/60 leading-[1.6]">
            Svara på några snabba frågor så hör jag av mig med en plan för din hemsida.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          <span className="text-xs text-ink/50">{step + 1} av {TOTAL_STEPS}</span>
          <div className="flex-1 h-px bg-ink/10 relative">
            <div
              className="absolute inset-y-0 left-0 bg-gold transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="min-h-[280px]">
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl text-ink leading-snug">
                Vad ska en besökare göra på sidan?
              </h2>
              <p className="text-sm text-ink/50">Välj ett eller flera alternativ.</p>
              <div className="grid grid-cols-2 gap-3">
                {MAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleMal(opt.id)}
                    className={`py-4 px-5 border text-left text-[15px] transition-all duration-200 ${
                      form.mal.includes(opt.id)
                        ? 'border-ink bg-ink text-cream'
                        : 'border-ink/15 text-ink hover:border-ink/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl text-ink leading-snug">
                Vilket företag gäller det?
              </h2>
              <input
                type="text"
                value={form.foretag}
                onChange={(e) => update({ foretag: e.target.value })}
                className="w-full bg-transparent border-b border-ink/15 py-3 text-ink text-[15px] placeholder:text-ink/30 focus:outline-none focus:border-ink/40 transition-colors"
                placeholder="Företagsnamn"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl text-ink leading-snug">
                Hur når jag dig?
              </h2>
              <input
                type="text"
                value={form.kontakt_namn}
                onChange={(e) => update({ kontakt_namn: e.target.value })}
                className="w-full bg-transparent border-b border-ink/15 py-3 text-ink text-[15px] placeholder:text-ink/30 focus:outline-none focus:border-ink/40 transition-colors"
                placeholder="Ditt namn"
              />
              <input
                type="email"
                value={form.kontakt_mejl}
                onChange={(e) => update({ kontakt_mejl: e.target.value })}
                className="w-full bg-transparent border-b border-ink/15 py-3 text-ink text-[15px] placeholder:text-ink/30 focus:outline-none focus:border-ink/40 transition-colors"
                placeholder="din@epost.se"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl text-ink leading-snug">
                Vilka tre tjänster tjänar ni mest på?
              </h2>
              <div className="space-y-4">
                {[
                  { key: 'tjanst1' as const, label: '1.' },
                  { key: 'tjanst2' as const, label: '2.' },
                  { key: 'tjanst3' as const, label: '3.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-3">
                    <span className="text-sm text-ink/40 w-5 shrink-0">{item.label}</span>
                    <input
                      type="text"
                      value={form[item.key]}
                      onChange={(e) => update({ [item.key]: e.target.value })}
                      className="w-full bg-transparent border-b border-ink/15 py-3 text-ink text-[15px] placeholder:text-ink/30 focus:outline-none focus:border-ink/40 transition-colors"
                      placeholder="T.ex. service, reparation..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl text-ink leading-snug">
                Vilka orter tar ni jobb i?
              </h2>
              <input
                type="text"
                value={form.omraden}
                onChange={(e) => update({ omraden: e.target.value })}
                className="w-full bg-transparent border-b border-ink/15 py-3 text-ink text-[15px] placeholder:text-ink/30 focus:outline-none focus:border-ink/40 transition-colors"
                placeholder="T.ex. Stenungsund, Tjörn, Orust..."
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl text-ink leading-snug">
                Vad är den vanligaste frågan kunder ställer innan de bokar?
              </h2>
              <textarea
                value={form.vanligaste_fragan}
                onChange={(e) => update({ vanligaste_fragan: e.target.value })}
                rows={3}
                className="w-full bg-transparent border-b border-ink/15 py-3 text-ink text-[15px] placeholder:text-ink/30 focus:outline-none focus:border-ink/40 transition-colors resize-none"
                placeholder="Skriv fritt..."
              />
              <p className="text-xs text-ink/40">Det brukar bli rubriken på sidan.</p>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl text-ink leading-snug">
                Bilder
              </h2>
              <p className="text-sm text-ink/55 leading-[1.6]">
                Bilder på jobb ni gjort, verkstaden, fordonen, er själva.
                Mobilkort duger gott. Fyra till åtta stycken räcker.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-10 border-2 border-dashed border-ink/15 hover:border-ink/30 transition-colors flex flex-col items-center gap-3 text-ink/50 hover:text-ink/70"
              >
                <Camera className="w-8 h-8" />
                <span className="text-[15px]">Ta kort eller välj från telefonen</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
              />

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img) => (
                    <div key={img.id} className="relative aspect-square bg-cream-deep overflow-hidden">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      {img.status === 'uploading' && (
                        <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-cream animate-spin" />
                        </div>
                      )}
                      {img.status === 'done' && (
                        <div className="absolute inset-0 bg-ink/30 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-cream" />
                        </div>
                      )}
                      {img.status === 'error' && (
                        <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-cream" />
                        </div>
                      )}
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 w-6 h-6 bg-ink/70 text-cream flex items-center justify-center hover:bg-ink"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setStep(7)}
                className="text-sm text-ink/50 hover:text-ink transition-colors"
              >
                <span className="link-underline">Jag skickar bilder senare</span>
              </button>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl text-ink leading-snug">
                Något annat jag borde veta?
              </h2>
              <textarea
                value={form.ovrigt}
                onChange={(e) => update({ ovrigt: e.target.value })}
                rows={4}
                className="w-full bg-transparent border-b border-ink/15 py-3 text-ink text-[15px] placeholder:text-ink/30 focus:outline-none focus:border-ink/40 transition-colors resize-none"
                placeholder="Valfritt — skriv fritt."
              />
              <div className="space-y-2">
                <label className="text-sm text-ink/60 block">
                  Länk till en sida ni tycker ser bra ut (valfritt)
                </label>
                <input
                  type="url"
                  value={form.referens_lank}
                  onChange={(e) => update({ referens_lank: e.target.value })}
                  className="w-full bg-transparent border-b border-ink/15 py-3 text-ink text-[15px] placeholder:text-ink/30 focus:outline-none focus:border-ink/40 transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-8 border-t border-ink/10">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Tillbaka
            </button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-ink text-cream text-[14px] tracking-wide hover:bg-navy transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Nästa
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-ink text-cream text-[14px] tracking-wide hover:bg-navy transition-colors duration-300 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Skickar...
                </>
              ) : (
                <>
                  Skicka till Otto
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-700/80">{error}</p>
        )}
      </div>
    </section>
  );
}
