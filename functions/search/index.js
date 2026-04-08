const TAVILY_API_KEY = "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";

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const engine = url.searchParams.get("engine") || "google";
  const lang = url.searchParams.get("lang") || "zh";

  if (!q) return new Response(JSON.stringify({ error: "Missing q parameter" }), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  });

  const engines = {
    "google":     `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=${lang}`,
    "google_hk":  `https://www.google.com.hk/search?q=${encodeURIComponent(q)}&hl=zh-CN`,
    "bing":       `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    "bing_cn":    `https://cn.bing.com/search?q=${encodeURIComponent(q)}&ensearch=0`,
    "duckduckgo": `https://duckduckgo.com/html/?q=${encodeURIComponent(q)}`,
    "brave":      `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
    "startpage":  `https://www.startpage.com/sp/search?query=${encodeURIComponent(q)}`,
    "ecosia":     `https://www.ecosia.org/search?q=${encodeURIComponent(q)}`,
    "qwant":      `https://www.qwant.com/?q=${encodeURIComponent(q)}`,
    "yahoo":      `https://search.yahoo.com/search?p=${encodeURIComponent(q)}`,
    "baidu":      `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`,
    "360":        `https://www.so.com/s?q=${encodeURIComponent(q)}`,
    "sogou":      `https://www.sogou.com/web?query=${encodeURIComponent(q)}`,
    "weixin":     `https://wx.sogou.com/weixin?type=2&query=${encodeURIComponent(q)}`,
    "toutiao":    `https://so.toutiao.com/search?keyword=${encodeURIComponent(q)}`,
    "jisilu":     `https://www.jisilu.cn/explore/?keyword=${encodeURIComponent(q)}`,
    "tavily":     `tavily:${q}`,
  };

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  ];

  const cascadeOrder = [
    "tavily",
    "google", "bing", "duckduckgo",
    "baidu", "360", "toutiao", "weixin", "jisilu", "bing_cn",
    "google_hk", "brave", "startpage", "ecosia", "qwant", "yahoo"
  ];

  const fetchWithUA = async (targetUrl, engineName) => {
    const ua = userAgents[Math.floor(Math.random() * userAgents.length)];

    // Tavily API
    if (targetUrl.startsWith("tavily:")) {
      try {
        const resp = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: TAVILY_API_KEY, query: q, search_depth: "basic", max_results: 10 })
        });
        const data = await resp.json();
        if (!resp.ok) return { html: "", status: resp.status, isBlocked: true, error: `Tavily: ${JSON.stringify(data)}` };
        const results = (data.results || []).map(r =>
          `<div class="result"><h3><a href="${r.url}">${r.title}</a></h3><p>${r.content || ""}</p><small>${r.url}</small></div>`
        ).join("\n");
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tavily: ${q}</title></head><body><h2>Tavily Results for: ${q}</h2>${results || "<p>No results.</p>"}</body></html>`;
        return { html, status: 200, isBlocked: false };
      } catch (e) {
        return { html: "", status: 0, isBlocked: true, error: e.message };
      }
    }

    try {
      const resp = await fetch(targetUrl, {
        headers: {
          "User-Agent": ua,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        }
      });
      const html = await resp.text();
      const trimmed = html.trim();
      const isBlocked = !trimmed || trimmed.length < 500 ||
        /captcha|403 Forbidden|Access Denied|block|blocked|please verify you are human/i.test(trimmed);
      return { html: trimmed, status: resp.status, isBlocked };
    } catch (e) {
      return { html: "", status: 0, isBlocked: true, error: e.message };
    }
  };

  // Single engine mode
  if (engine !== "cascade") {
    const targetUrl = engines[engine];
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: `Unknown engine: ${engine}`, available: Object.keys(engines) }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }
    const { html, status } = await fetchWithUA(targetUrl, engine);
    return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" } });
  }

  // Cascade mode
  let lastResult = null;
  for (const eng of cascadeOrder) {
    const targetUrl = engines[eng];
    if (!targetUrl) continue;
    const result = await fetchWithUA(targetUrl, eng);
    if (!result.isBlocked && result.html && result.status < 400) {
      return new Response(result.html, {
        status: result.status,
        headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store", "X-Search-Engine": eng }
      });
    }
    lastResult = result;
  }

  return new Response(JSON.stringify({
    error: "All search engines failed or were blocked",
    tried: cascadeOrder,
    lastStatus: lastResult?.status,
    lastError: lastResult?.error
  }), { status: 502, headers: { "Content-Type": "application/json" } });
}
