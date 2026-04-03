export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const engine = url.searchParams.get("engine") || "google";

  if (!q) return new Response(JSON.stringify({ error: "Missing q" }), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  });

  // === Zhipu Web Search API ===
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
          search_engine: "google",
          top_n: 10,
          recency_days: -1
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

  // === Traditional search engines ===
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
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });

  const html = await resp.text();
  return new Response(html, {
    status: resp.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
