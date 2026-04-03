export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const engine = url.searchParams.get("engine") || "cascade";

  if (!q) return new Response(JSON.stringify({ error: "Missing q" }), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  });

  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  // ── Cascade: fetch all three, combine results ──
  if (engine === "cascade") {
    const results = { google: null, duckduckgo: null, zhipu: null };
    const errors = {};

    // 1) Google
    try {
      const googleUrl = "https://www.google.com/search?q=" + encodeURIComponent(q) + "&hl=en";
      const r1 = await fetch(googleUrl, {
        headers: { "User-Agent": userAgent, "Accept": "text/html", "Accept-Language": "en-US,en;q=0.9" }
      });
      results.google = { status: r1.status, ok: r1.ok, blocked: r1.status === 429 || r1.status === 403 };
    } catch (e) {
      errors.google = e.message;
    }

    // 2) DuckDuckGo
    try {
      const ddgUrl = "https://duckduckgo.com/html/?q=" + encodeURIComponent(q);
      const r2 = await fetch(ddgUrl, {
        headers: { "User-Agent": userAgent, "Accept": "text/html" }
      });
      const html = await r2.text();
      // Extract titles + links from DDG HTML
      const titles = [], links = [];
      const re = /<a class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
      let m;
      while ((m = re.exec(html)) !== null && titles.length < 10) {
        links.push(m[1]);
        titles.push(m[2].replace(/<[^>]+>/g, ""));
      }
      results.duckduckgo = { status: r2.status, ok: r2.ok, titles, links };
    } catch (e) {
      errors.duckduckgo = e.message;
    }

    // 3) Zhipu
    try {
      const apiKey = "3dd368b7959d4bbdb789192b598fba34.Y5830RtktIb8rIpi";
      const r3 = await fetch("https://open.bigmodel.cn/api/paas/v4/web_search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          search_query: q,
          search_engine: "search_pro_quark",
          count: 10
        })
      });
      const data = await r3.json();
      results.zhipu = { status: r3.status, ok: r3.ok, data };
    } catch (e) {
      errors.zhipu = e.message;
    }

    return new Response(JSON.stringify({
      query: q,
      engines: results,
      errors: Object.keys(errors).length ? errors : undefined,
      note: "All three engines fetched. Synthesize titles/links/data for the user."
    }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  // ── Individual engines ──
  if (engine === "zhipu") {
    const apiKey = "3dd368b7959d4bbdb789192b598fba34.Y5830RtktIb8rIpi";
    try {
      const resp = await fetch("https://open.bigmodel.cn/api/paas/v4/web_search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          search_query: q,
          search_engine: "search_pro_quark",
          count: 10
        })
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data, null, 2), {
        status: resp.status,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  const engines = {
    google:     "https://www.google.com/search?q=" + encodeURIComponent(q) + "&hl=en",
    bing:       "https://www.bing.com/search?q=" + encodeURIComponent(q),
    duckduckgo: "https://duckduckgo.com/html/?q=" + encodeURIComponent(q)
  };

  const targetUrl = engines[engine];
  if (!targetUrl) return new Response(JSON.stringify({ error: "Unknown engine: " + engine }), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  });

  const resp = await fetch(targetUrl, {
    headers: {
      "User-Agent": userAgent,
      "Accept": "text/html",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });

  const html = await resp.text();
  return new Response(html, {
    status: resp.status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" }
  });
}
