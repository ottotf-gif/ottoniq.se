import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function getNextTuesday(): string {
  const now = new Date();
  const day = now.getDay();
  let daysUntilTuesday = (2 - day + 7) % 7;
  if (daysUntilTuesday === 0) daysUntilTuesday = 7;
  const tuesday = new Date(now);
  tuesday.setDate(now.getDate() + daysUntilTuesday);
  const months = [
    "januari", "februari", "mars", "april", "maj", "juni",
    "juli", "augusti", "september", "oktober", "november", "december",
  ];
  return `Tisdag ${tuesday.getDate()} ${months[tuesday.getMonth()]}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const foretag = (body.foretag || "Okänt företag").trim();
    const kontaktNamn = (body.kontakt_namn || "").trim();
    const kontaktMejl = (body.kontakt_mejl || "").trim().toLowerCase();

    if (!foretag || !kontaktMejl) {
      return new Response(
        JSON.stringify({ error: "Företag och e-post krävs" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let slug = generateSlug(foretag) || `brief-${Date.now()}`;

    const { data: existing } = await supabase
      .from("kunder")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const { data: kund, error: kundErr } = await supabase
      .from("kunder")
      .insert({
        slug,
        foretag,
        kontakt_namn: kontaktNamn || "-",
        kontakt_mejl: kontaktMejl,
      })
      .select()
      .single();

    if (kundErr || !kund) {
      return new Response(
        JSON.stringify({ error: "Kunde inte skapa kund" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bilder = (body.bilder as string[]) || [];

    const { data: brief, error: briefErr } = await supabase
      .from("brief")
      .insert({
        kund_id: kund.id,
        foretag_fritext: foretag,
        mal: body.mal || "",
        tjanster: body.tjanster || "",
        omraden: body.omraden || "",
        vanligaste_fragan: body.vanligaste_fragan || "",
        referens_lank: body.referens_lank || null,
        ovrigt: body.ovrigt || null,
        bilder,
      })
      .select()
      .single();

    if (briefErr || !brief) {
      return new Response(
        JSON.stringify({ error: "Kunde inte spara briefen" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const signedUrls: string[] = [];
    if (bilder.length > 0) {
      const { data: urls } = await supabase.storage
        .from("brief-bilder")
        .createSignedUrls(bilder, 60 * 60 * 24 * 7);
      if (urls) {
        for (const u of urls) {
          if (u.signedUrl) signedUrls.push(u.signedUrl);
        }
      }
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const deliveryDate = getNextTuesday();

    const ottoSummary = [
      `NY BRIEF FRÅN: ${foretag}`,
      `Kontakt: ${kontaktNamn || "-"} (${kontaktMejl})`,
      `Slug: ${slug}`,
      ``,
      `Mål: ${body.mal || "-"}`,
      `Tjänster: ${body.tjanster || "-"}`,
      `Områden: ${body.omraden || "-"}`,
      `Vanligaste frågan: ${body.vanligaste_fragan || "-"}`,
      body.referens_lank ? `Referenslänk: ${body.referens_lank}` : null,
      body.ovrigt ? `Övrigt: ${body.ovrigt}` : null,
      ``,
      `Antal bilder: ${bilder.length}`,
      signedUrls.length > 0
        ? `Bildlänkar (giltiga 7 dagar):\n${signedUrls.join("\n")}`
        : null,
    ].filter(Boolean).join("\n");

    const customerSummary = [
      `Hej ${kontaktNamn || ""},`,
      ``,
      `Tack för att du skickade in informationen om ${foretag}.`,
      `Jag läser igenom allt och hör av mig senast ${deliveryDate}.`,
      ``,
      `Om du har frågor under tiden, ring 070-422 38 87 eller svara på detta mejl.`,
      ``,
      `Vänliga hälsningar,`,
      `Otto — Ottoniq`,
    ].join("\n");

    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Ottoniq <noreply@ottoniq.se>",
          to: "ottoniq.se@gmail.com",
          subject: `Ny brief: ${foretag}`,
          text: ottoSummary,
        }),
      });

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Ottoniq <noreply@ottoniq.se>",
          to: kontaktMejl,
          subject: `Tack — jag hör av mig senast ${deliveryDate}`,
          text: customerSummary,
        }),
      });
    } else {
      console.log("No RESEND_API_KEY — Otto summary:\n", ottoSummary);
      console.log("Customer summary:\n", customerSummary);
    }

    return new Response(
      JSON.stringify({ ok: true, delivery_date: deliveryDate }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Okänt fel" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
