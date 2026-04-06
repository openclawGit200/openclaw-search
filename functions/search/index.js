// Shared HTML parser for search result titles/links
function parseGeneric(html, titleRe, linkRe, maxResults = 10) {
  const titles = [], links = [];
  let m;
  while ((m = titleRe.exec(html)) !== null && titles.length < maxResults) {
    const text = m[2].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
    if (text && text.length > 5) titles.push(text);
  }
  const seen = new Set();
  while ((m = linkRe.exec(html)) !== null && links.length < maxResults) {
    let link = m[1].replace("/url?q=", "").split("&")[0];
    if (link.startsWith("http") && !seen.has(link)) { seen.add(link); links.push(link); }
  }
  return { titles, links };
}

// ── Baidu ─────────────────────────────────────
const BAIDU_TITLE_RE = /<h3 class="c-title"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const BAIDU_LINK_RE = /<h3 class="c-title"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"/g;
function parseBaidu(html) {
  return parseGeneric(html, BAIDU_TITLE_RE, BAIDU_LINK_RE);
}

// ── Bing ─────────────────────────────────────
const BING_TITLE_RE = /<li class="b_algo"[\s\S]*?<h2[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const BING_LINK_RE = /<li class="b_algo"[\s\S]*?<a[^>]+href="([^"]+)"/g;
function parseBing(html) {
  return parseGeneric(html, BING_TITLE_RE, BING_LINK_RE);
}

// ── 360 ─────────────────────────────────────
const S360_TITLE_RE = /<h3[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const S360_LINK_RE = /<h3[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"/g;
function parse360(html) {
  return parseGeneric(html, S360_TITLE_RE, S360_LINK_RE);
}

// ── Sogou ─────────────────────────────────────
const SOGOU_TITLE_RE = /<h3[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const SOGOU_LINK_RE = /<h3[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"/g;
function parseSogou(html) {
  return parseGeneric(html, SOGOU_TITLE_RE, SOGOU_LINK_RE);
}

// ── Toutiao ─────────────────────────────────────
const Toutiao_TITLE_RE = /<div class="article-content[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const Toutiao_LINK_RE = /<div class="article-content[\s\S]*?<a[^>]+href="([^"]+)"/g;
function parseToutiao(html) {
  return parseGeneric(html, Toutiao_TITLE_RE, Toutiao_LINK_RE);
}

// ── Brave ─────────────────────────────────────
const BRAVE_TITLE_RE = /<div class="title[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const BRAVE_LINK_RE = /<div class="title[\s\S]*?<a[^>]+href="([^"]+)"/g;
function parseBrave(html) {
  return parseGeneric(html, BRAVE_TITLE_RE, BRAVE_LINK_RE);
}

// ── Google ─────────────────────────────────────
const GOOGLE_TITLE_RE = /<div class="BNeawe[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
const GOOGLE_LINK_RE = /<a href="(\/url\?q=[^"&amp;]+|https?:\/\/[^"]+)"[^>]*>/g;
function parseGoogle(html) {
  const titles = [], links = [];
  let m;
  while ((m = GOOGLE_TITLE_RE.exec(html)) !== null && titles.length < 10) {
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    if (text && text.length > 10) titles.push(text);
  }
  const seen = new Set();
  while ((m = GOOGLE_LINK_RE.exec(html)) !== null && links.length < 10) {
    let link = m[1].replace("/url?q=", "").split("&")[0];
    if (link.startsWith("http") && !seen.has(link)) { seen.add(link); links.push(link); }
  }
  return { titles, links };
}

// ── DuckDuckGo ─────────────────────────────────────
const DDG_TITLE_RE = /<a class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const DDG_LINK_RE = /<a class="result__a"[^>]+href="([^"]+)"/g;
function parseDDG(html) {
  return parseGeneric(html, DDG_TITLE_RE, DDG_LINK_RE);
}

// ── Yahoo ─────────────────────────────────────
const YAHOO_TITLE_RE = /<h3[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const YAHOO_LINK_RE = /<h3[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"/g;
function parseYahoo(html) {
  return parseGeneric(html, YAHOO_TITLE_RE, YAHOO_LINK_RE);
}

// ── Ecosia ─────────────────────────────────────
const ECOSIA_TITLE_RE = /<div class="result-title[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const ECOSIA_LINK_RE = /<div class="result-title[\s\S]*?<a[^>]+href="([^"]+)"/g;
function parseEcosia(html) {
  return parseGeneric(html, ECOSIA_TITLE_RE, ECOSIA_LINK_RE);
}

// ── Startpage ─────────────────────────────────────
const STARPAGE_TITLE_RE = /<h3[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const STARPAGE_LINK_RE = /<h3[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"/g;
function parseStartpage(html) {
  return parseGeneric(html, STARPAGE_TITLE_RE, STARPAGE_LINK_RE);
}

// ── Qwant ─────────────────────────────────────
const QWANT_TITLE_RE = /<div class="result__title[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const QWANT_LINK_RE = /<div class="result__title[\s\S]*?<a[^>]+href="([^"]+)"/g;
function parseQwant(html) {
  return parseGeneric(html, QWANT_TITLE_RE, QWANT_LINK_RE);
}

// ── WeChat ─────────────────────────────────────
const WEIXIN_TITLE_RE = /<div class="txt-box[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const WEIXIN_LINK_RE = /<div class="txt-box[\s\S]*?<a[^>]+href="([^"]+)"/g;
function parseWeixin(html) {
  return parseGeneric(html, WEIXIN_TITLE_RE, WEIXIN_LINK_RE);
}

// ── Jisilu ─────────────────────────────────────
const JISILU_TITLE_RE = /<div class=" Awoke-item__inner[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
const JISILU_LINK_RE = /<div class=" Awoke-item__inner[\s\S]*?<a[^>]+href="([^"]+)"/g;
function parseJisilu(html) {
  return parseGeneric(html, JISILU_TITLE_RE, JISILU_LINK_RE);
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const engine = url.searchParams.get("engine") || "cascade";

  if (!q) return new Response(JSON.stringify({ error: "Missing q" }), {
    status: 400,
    headers: { "Content-Type": "application/json" }
  });

  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  // ── Cascade: all 17 engines in parallel ──────────────────────
  if (engine === "cascade") {
    const apiKey = "3dd368b7959d4bbdb789192b598fba34.Y5830RtktIb8rIpi";
    const zhUa = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    const [googleRes, ddgRes, zhipuRes, bingRes, baiduRes,
           braveRes, yahooRes, ecosiaRes, startpageRes, qwantRes,
           weixinRes, toutiaoRes, sogouRes, s360Res, jisiluRes,
           googleHKKRes, bingCNRes] = await Promise.all([

      // ── Global (9) ──
      fetch("https://www.google.com/search?q=" + encodeURIComponent(q), {
        headers: { "User-Agent": ua, "Accept": "text/html", "Accept-Language": "en-US,en;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseGoogle(html);
        return { status: r.status, ok: r.ok, blocked: r.status === 429 || r.status === 403, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://duckduckgo.com/html/?q=" + encodeURIComponent(q), {
        headers: { "User-Agent": ua, "Accept": "text/html" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseDDG(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      // ── Zhipu (Chinese AI search) ──
      fetch("https://open.bigmodel.cn/api/paas/v4/web_search", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ search_query: q, search_engine: "search_pro_quark", count: 10 })
      }).then(async r => {
        const data = await r.json();
        return { status: r.status, ok: r.ok, data };
      }).catch(e => ({ error: e.message })),

      // ── CN (8) ──
      fetch("https://www.bing.com/search?q=" + encodeURIComponent(q), {
        headers: { "User-Agent": ua, "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseBing(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://www.baidu.com/s?wd=" + encodeURIComponent(q) + "&rn=10", {
        headers: { "User-Agent": zhUa, "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseBaidu(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://search.brave.com/search?q=" + encodeURIComponent(q), {
        headers: { "User-Agent": ua, "Accept": "text/html" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseBrave(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://search.yahoo.com/search?p=" + encodeURIComponent(q), {
        headers: { "User-Agent": ua, "Accept": "text/html", "Accept-Language": "en-US,en;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseYahoo(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://www.ecosia.org/search?q=" + encodeURIComponent(q), {
        headers: { "User-Agent": ua, "Accept": "text/html" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseEcosia(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://www.startpage.com/sp/search?query=" + encodeURIComponent(q), {
        headers: { "User-Agent": ua, "Accept": "text/html" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseStartpage(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://www.qwant.com/?q=" + encodeURIComponent(q), {
        headers: { "User-Agent": ua, "Accept": "text/html" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseQwant(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://wx.sogou.com/weixin?type=2&query=" + encodeURIComponent(q), {
        headers: { "User-Agent": zhUa, "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseWeixin(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://so.toutiao.com/search?keyword=" + encodeURIComponent(q), {
        headers: { "User-Agent": zhUa, "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseToutiao(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://sogou.com/web?query=" + encodeURIComponent(q), {
        headers: { "User-Agent": zhUa, "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseSogou(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://www.so.com/s?q=" + encodeURIComponent(q), {
        headers: { "User-Agent": zhUa, "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parse360(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://www.jisilu.cn/explore/?keyword=" + encodeURIComponent(q), {
        headers: { "User-Agent": zhUa, "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseJisilu(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://www.google.com.hk/search?q=" + encodeURIComponent(q), {
        headers: { "User-Agent": ua, "Accept": "text/html", "Accept-Language": "zh-TW,zh;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseGoogle(html);
        return { status: r.status, ok: r.ok, blocked: r.status === 429 || r.status === 403, titles, links };
      }).catch(e => ({ error: e.message })),

      fetch("https://cn.bing.com/search?q=" + encodeURIComponent(q) + "&ensearch=0", {
        headers: { "User-Agent": zhUa, "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9" }
      }).then(async r => {
        const html = await r.text();
        const { titles, links } = parseBing(html);
        return { status: r.status, ok: r.ok, titles, links };
      }).catch(e => ({ error: e.message })),
    ]);

    return new Response(JSON.stringify({
      query: q,
      engines: {
        google:      googleRes,
        duckduckgo:  ddgRes,
        zhipu:       zhipuRes,
        bing:        bingRes,
        baidu:       baiduRes,
        brave:       braveRes,
        yahoo:       yahooRes,
        ecosia:      ecosiaRes,
        startpage:   startpageRes,
        qwant:       qwantRes,
        weixin:      weixinRes,
        toutiao:     toutiaoRes,
        sogou:       sogouRes,
        "360":       s360Res,
        jisilu:      jisiluRes,
        google_hk:   googleHKKRes,
        bing_cn:     bingCNRes,
      },
      note: "17 engines fetched in parallel. Zhipu = Chinese AI search (best for CN news). Baidu/Bing CN/Toutiao = Chinese engines. Google/DDG/Brave/Yahoo = Global. Use zhipu as primary for Chinese financial news."
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

  // ── Static HTML engines ──
  const staticEngines = {
    google:      "https://www.google.com/search?q=" + encodeURIComponent(q),
    bing:        "https://www.bing.com/search?q=" + encodeURIComponent(q),
    duckduckgo:  "https://duckduckgo.com/html/?q=" + encodeURIComponent(q),
    baidu:       "https://www.baidu.com/s?wd=" + encodeURIComponent(q),
    yahoo:       "https://search.yahoo.com/search?p=" + encodeURIComponent(q),
    brave:       "https://search.brave.com/search?q=" + encodeURIComponent(q),
    ecosia:      "https://www.ecosia.org/search?q=" + encodeURIComponent(q),
    startpage:   "https://www.startpage.com/sp/search?query=" + encodeURIComponent(q),
    qwant:       "https://www.qwant.com/?q=" + encodeURIComponent(q),
    weixin:      "https://wx.sogou.com/weixin?type=2&query=" + encodeURIComponent(q),
    toutiao:     "https://so.toutiao.com/search?keyword=" + encodeURIComponent(q),
    sogou:       "https://sogou.com/web?query=" + encodeURIComponent(q),
    "360":       "https://www.so.com/s?q=" + encodeURIComponent(q),
    jisilu:      "https://www.jisilu.cn/explore/?keyword=" + encodeURIComponent(q),
    google_hk:   "https://www.google.com.hk/search?q=" + encodeURIComponent(q),
    bing_cn:     "https://cn.bing.com/search?q=" + encodeURIComponent(q),
  };

  const targetUrl = staticEngines[engine];
  if (!targetUrl) return new Response(JSON.stringify({
    error: "Unknown engine: " + engine,
    available: Object.keys(staticEngines).concat(["cascade", "zhipu"])
  }), { status: 400, headers: { "Content-Type": "application/json" } });

  const resp = await fetch(targetUrl, {
    headers: { "User-Agent": ua, "Accept": "text/html", "Accept-Language": "zh-CN,zh;q=0.9" }
  });
  const html = await resp.text();
  return new Response(html, {
    status: resp.status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" }
  });
}
