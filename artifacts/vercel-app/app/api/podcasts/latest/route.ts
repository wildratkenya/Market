import { NextResponse } from "next/server";

const RSS_URL = "https://rss.buzzsprout.com/1999543.rss";

function parseDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins + ":" + secs.toString().padStart(2, "0");
}

export async function GET() {
  try {
    const response = await fetch(RSS_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("RSS fetch failed");
    }

    const xml = await response.text();
    const items = [];

    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let count = 0;

    while ((match = itemRegex.exec(xml)) !== null && count < 3) {
      const itemXml = match[1];
      
      const getTag = (tag) => {
        let m = itemXml.match(new RegExp("<itunes:" + tag + "[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/itunes:" + tag + ">", "i"));
        if (!m) m = itemXml.match(new RegExp("<itunes:" + tag + "[^>]*>([\\s\\S]*?)<\\/itunes:" + tag + ">", "i"));
        if (!m) m = itemXml.match(new RegExp("<" + tag + "[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/" + tag + ">", "i"));
        if (!m) m = itemXml.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\\/" + tag + ">", "i"));
        return m ? m[1].trim() : "";
      };

      const enclosure = itemXml.match(/<enclosure[^>]+url="([^"]+)"/);
      const durationTag = getTag("duration");
      const durationSeconds = parseInt(durationTag) || 0;
      
      const title = getTag("title") || "Episode " + (count + 1);
      const pubDate = getTag("pubDate");
      
      items.push({
        id: count + 1,
        title: title,
        description: getTag("summary") || getTag("description"),
        publishedAt: pubDate,
        duration: parseDuration(durationSeconds),
        audioUrl: enclosure ? enclosure[1] : "",
        buzzsproutUrl: "https://www.buzzsprout.com/1999543",
      });
      count++;
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("RSS parse error:", error);
    return NextResponse.json([]);
  }
}