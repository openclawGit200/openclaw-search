export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const engine = url.searchParams.get("engine") || "cascade";

  if (!q) return new Response(JSON.stringify({ error: "Missing q" }), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  });

  const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  // ── Cascade: fetch all engines in parallel ──
  if (engine === "cascade") {
    const apiKey = "3dd368b7959d4bbdb789192b598fba34.Y5830RtktIb8rIpi";

    const [googleRes, ddgRes, zhipuRes, bingRes, baiduRes] = await Promise.all([

      // 1) Google
      fetch("https://www.google.com/search?q=" + encodeURIComponent(q) + "&hl=en", {
        headers: { "User-Agent": userAgent, "Accept": "text/html", "Accept-Language": "en-US,en;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const titles = [], links = [];
        const re = /<div class="BNeawe[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
        let m;
        while ((m = re.exec(html)) !== null && titles.length < 10) {
          const text = m[1].replace(/<[^>]+>/g, "").trim();
          if (text && text.length > 10) titles.push(text);
        }
        const linkRe = /<a href="(\/url\?q=[^"&amp;]+|https?:\/\/[^"]+)"[^>]*>/g;
        const seen = new Set();
        while ((m = linkRe.exec(html)) !== null && links.length < 10) {
          let link = m[1].replace("/url?q=", "").split("&")[0];
          if (link.startsWith("http") && !seen.has(link)) { seen.add(link); links.push(link); }
        }
        return { status: r.status, ok: r.ok, blocked: r.status === 429 || r.status === 403, titles, links };
      }).catch(e => ({ error: e.message })),

      // 2) DuckDuckGo
      fetch("https://duckduckgo.com/html/?q=" + encodeURIComponent(q), {
        headers: { "User-Agent": userAgent, "Accept": "text/html" }
      }).then(async r => {
        const html = await r.text();
        const titles = [], links = [];
        const re = /<a class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
        let m;
        while ((m = re.exec(html)) !== null && titles.length < 10) {
          links.push(m[1]);
          titles.push(m[2].replace(/<[^>]+>/g, ""));
        }
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      // 3) Bing
      fetch("https://www.bing.com/search?q=" + encodeURIComponent(q), {
        headers: { "User-Agent": userAgent, "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const titles = [], links = [];
        // <li class="b_algo"> → <h2> → <a>
        const re = /<li class="b_algo"[\s\S]*?<h2[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
        let m;
        while ((m = re.exec(html)) !== null && titles.length < 10) {
          links.push(m[1]);
          titles.push(m[2].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim());
        }
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      // 4) Baidu
      fetch("https://www.baidu.com/s?wd=" + encodeURIComponent(q) + "&rn=10", {
        headers: { "User-Agent": userAgent, "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const titles = [], links = [];
        // <h3 class="c-title"> → <a href="...">title</a>
        const re = /<h3 class="c-title"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
        let m;
        while ((m = re.exec(html)) !== null && titles.length < 10) {
          links.push(m[1]);
          titles.push(m[2].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim());
        }
        // fallback: <div class="c-abstract">
        if (titles.length === 0) {
          const absRe = /<div class="c-abstract"[^>]*>([\s\S]*?)<\/div>/g;
          while ((m = absRe.exec(html)) !== null && titles.length < 10) {
            const text = m[1].replace(/<[^>]+>/g, "").trim();
            if (text.length > 10) titles.push(text);
          }
        }
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      // 5) Zhipu
      fetch("https://open.bigmodel.cn/api/paas/v4/web_search", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ search_query: q, search_engine: "search_pro_quark", count: 10 })
      }).then(async r => {
        const data = await r.json();
        return { status: r.status, ok: r.ok, data };
      }).catch(e => ({ error: e.message }))
    ]);

    const results = { google: googleRes, duckduckgo: ddgRes, bing: bingRes, baidu: baiduRes, zhipu: zhipuRes };

    return new Response(JSON.stringify({
      query: q,
      engines: results,
      note: "5 engines fetched in parallel. Use zhipu for Chinese news; bing/baidu as backup."
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
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ search_query: q, search_engine: "search_pro_quark", count: 10 })
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
    duckduckgo: "https://duckduckgo.com/html/?q=" + encodeURIComponent(q),
    baidu:      "https://www.baidu.com/s?wd=" + encodeURIComponent(q) + "&rn=10"
  };

  const targetUrl = engines[engine];
  if (!targetUrl) return new Response(JSON.stringify({ error: "Unknown engine: " + engine }), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  });

  const resp = await fetch(targetUrl, {
    headers: { "User-Agent": userAgent, "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9" }
  });

  const html = await resp.text();
  return new Response(html, {
    status: resp.status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" }
  });
}
