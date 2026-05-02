const SUPABASE_URL = "https://nualwgobuhklnoaeawrz.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function supabaseQuery(table: string, query: string) {
  const url = SUPABASE_URL + "/rest/v1/" + table + "?" + query;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("Supabase error: " + res.status);
  }
  return res.json();
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = new URL(req.url || "/", "http://localhost");
  const path = url.pathname;

  try {
    if (path === "/api/books" && req.method === "GET") {
      const data = await supabaseQuery("books", "order=id.asc");
      return res.status(200).json(data);
    }

    if (path === "/api/podcasts/latest") {
      const data = await supabaseQuery("podcasts", "order=published_at.desc&limit=3");
      return res.status(200).json(data);
    }

    if (path.startsWith("/api/pages/")) {
      const pageName = path.replace("/api/pages/", "");
      const data = await supabaseQuery("site_pages", "page_name=eq." + pageName);
      return res.status(200).json(Array.isArray(data) ? data[0] || null : data);
    }

    return res.status(404).json({ error: "Not found", path });
  } catch (err: any) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
