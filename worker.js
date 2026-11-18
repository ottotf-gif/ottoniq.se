// Cloudflare Worker för ottoniq.se.
//
// Serverar den statiska sajten OCH fungerar som en same-origin-proxy mot
// Supabase: alla anrop till /sb/* vidarebefordras server-side till Supabase.
// Det gör att webbläsaren aldrig behöver göra ett cross-origin-anrop, vilket
// eliminerar CORS/preflight-problem, bot-skydd och blockering från
// webbläsartillägg. Headers (apikey, Authorization) skickas med oförändrade.
const SUPABASE_ORIGIN = 'https://nxnitpsmynfttyoczilk.supabase.co';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/sb/')) {
      const target = SUPABASE_ORIGIN + url.pathname.slice(3) + url.search;
      return fetch(new Request(target, request));
    }

    if (url.pathname === '/kvanta') {
      return Response.redirect(new URL('/kvanta/', request.url), 301);
    }
    if (url.pathname === '/kvanta/integritet') {
      return Response.redirect(new URL('/kvanta/integritet/', request.url), 301);
    }

    // Allt annat: servera de statiska filerna (med SPA-fallback till index.html).
    return env.ASSETS.fetch(request);
  },
};
