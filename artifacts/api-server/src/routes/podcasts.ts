import { Router, type IRouter } from "express";

const RSS_URL = "https://rss.buzzsprout.com/1999543.rss";
const BUZZSPROUT_BASE = "https://www.buzzsprout.com/1999543";

function parseDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins + ":" + secs.toString().padStart(2, "0");
}

async function parseRSS(limit = 100): Promise<any[]> {
  const response = await fetch(RSS_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) throw new Error("RSS fetch failed: " + response.status);
  const xml = await response.text();
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    if (items.length >= limit) break;
    const content = match[1];
    const getTag = (tag: string): string => {
      const regex = new RegExp("<" + tag + "[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/" + tag + ">|<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "i");
      const m = content.match(regex);
      return m ? (m[1] || m[2] || "").trim() : "";
    };
    const durationSeconds = parseInt(getTag("itunes:duration")) || 0;
    const enclosure = content.match(/<enclosure[^>]+url="([^"]+)"/);
    items.push({
      id: items.length + 1,
      title: getTag("title"),
      description: getTag("description").replace(/<[^>]*>/g, "").substring(0, 300),
      publishedAt: getTag("pubDate"),
      duration: parseDuration(durationSeconds),
      audioUrl: enclosure ? enclosure[1] : "",
      buzzsproutUrl: BUZZSPROUT_BASE,
    });
  }
  return items;
}

const router: IRouter = Router();

router.get("/podcasts", async (_req, res) => {
  try {
    const items = await parseRSS(100);
    res.json(items);
  } catch (err) {
    console.error("RSS parse error:", err);
    try {
      const { supabase } = await import("../lib/supabase");
      const { data } = await supabase.from("podcasts").select("*").order("published_at", { ascending: false }).limit(100);
      res.json(data || []);
    } catch {
      res.status(500).json({ error: "Failed to fetch podcasts" });
    }
  }
});

router.get("/podcasts/latest", async (_req, res) => {
  try {
    const items = await parseRSS(3);
    res.json(items);
  } catch (err) {
    console.error("RSS parse error:", err);
    try {
      const { supabase } = await import("../lib/supabase");
      const { data } = await supabase.from("podcasts").select("*").order("published_at", { ascending: false }).limit(3);
      res.json(data || []);
    } catch {
      res.status(500).json({ error: "Failed to fetch latest podcasts" });
    }
  }
});

export default router;
