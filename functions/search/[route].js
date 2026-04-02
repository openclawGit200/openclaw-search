export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const engine = url.searchParams.get("engine") || "google";
  return new Response(JSON.stringify({ q, engine, test: "Functions working" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
