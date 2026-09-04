import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { brief_id } = await req.json();
    if (!brief_id) {
      return new Response(
        JSON.stringify({ error: "brief_id krävs" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: brief, error: briefErr } = await supabase
      .from("brief")
      .select("*, kunder(*)")
      .eq("id", brief_id)
      .maybeSingle();

    if (briefErr || !brief) {
      return new Response(
        JSON.stringify({ error: "Brief hittades inte" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bilder = (brief.bilder as string[]) || [];
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

    const summary = [
      `NY BRIEF FRÅN: ${brief.kunder?.foretag || "Okänt"}`,
      `Slug: ${brief.kunder?.slug || "-"}`,
      ``,
      `Mål: ${brief.mal}`,
      `Tjänster: ${brief.tjanster}`,
      `Områden: ${brief.omraden}`,
      `Vanligaste frågan: ${brief.vanligaste_fragan}`,
      brief.referens_lank ? `Referenslänk: ${brief.referens_lank}` : null,
      brief.ovrigt ? `Övrigt: ${brief.ovrigt}` : null,
      ``,
      `Antal bilder: ${bilder.length}`,
      signedUrls.length > 0
        ? `Bildlänkar (giltiga 7 dagar):\n${signedUrls.join("\n")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Ottoniq <noreply@ottoniq.se>",
          to: "ottoniq.se@gmail.com",
          subject: `Ny brief: ${brief.kunder?.foretag || "Okänt företag"}`,
          text: summary,
        }),
      });

      if (!emailRes.ok) {
        console.error("Email failed:", await emailRes.text());
      }
    } else {
      console.log("No RESEND_API_KEY — logging summary:\n", summary);
    }

    return new Response(
      JSON.stringify({ ok: true, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Okänt fel" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
