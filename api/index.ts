import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://nualwgobuhklnoaeawrz.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = new URL(req.url || "/", "http://localhost");
  const path = url.pathname;

  try {
    if (path === "/api/books" && req.method === "GET") {
      const { data, error } = await supabase.from("books").select("*").order("id", { ascending: true });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (path === "/api/podcasts/latest") {
      const { data, error } = await supabase.from("podcasts").select("*").order("published_at", { ascending: false }).limit(3);
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (path.startsWith("/api/pages/")) {
      const pageName = path.replace("/api/pages/", "");
      const { data, error } = await supabase.from("site_pages").select("*").eq("page_name", pageName).maybeSingle();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (path === "/api/healthz") {
      return res.status(200).json({ ok: true });
    }

    return res.status(404).json({ error: "Not found", path });
  } catch (err: any) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
