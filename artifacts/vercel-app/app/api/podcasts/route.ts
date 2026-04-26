import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const RSS_URL = "https://rss.buzzsprout.com/1999543.rss";
const BUZZSPROUT_BASE = "https://www.buzzsprout.com/1999543";

interface ParsedItem {
  guid: string;
  title: string;
  description: string;
  publishedAt: string;
  duration: string;
  audioUrl: string;
  buzzsproutUrl: string;
}

function parseDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins + ":" + secs.toString().padStart(2, "0");
}

async function parseRSS(): Promise<ParsedItem[]> {
  const response = await fetch(RSS_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("RSS fetch failed: " + response.status);
  }

  const xml = await response.text();
  const items: ParsedItem[] = [];

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const getTag = (tag: string): string => {
      const regex = new RegExp("<" + tag + "[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/" + tag + ">|<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "i");
      const m = itemXml.match(regex);
      return m ? (m[1] || m[2] || "").trim() : "";
    };

    const guid = getTag("guid");
    const title = getTag("title");
    const description = getTag("description");
    const pubDate = getTag("pubDate");
    const durationTag = getTag("itunes:duration");
    const enclosure = itemXml.match(/<enclosure[^>]+url="([^"]+)"/);

    const durationSeconds = parseInt(durationTag) || 0;
    const audioUrl = enclosure ? enclosure[1] : "";

    items.push({
      guid,
      title,
      description,
      publishedAt: pubDate,
      duration: parseDuration(durationSeconds),
      audioUrl,
      buzzsproutUrl: BUZZSPROUT_BASE,
    });
  }

  return items;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "100");

  try {
    const items = await parseRSS();
    return NextResponse.json(items.slice(0, limit));
  } catch (error) {
    console.error("RSS parse error:", error);

    const supabase = getSupabase();
    const { data, error: dbError } = await supabase
      .from("podcasts")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }
    return NextResponse.json(data || []);
  }
}