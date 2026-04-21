import { db } from "@workspace/db";
import { booksTable, podcastsTable } from "@workspace/db/schema";
import { supabase } from "./supabase";
import { desc } from "drizzle-orm";
import { logger } from "./logger";

export async function fetchBooks() {
  try {
    // Try Drizzle (Primary)
    return await db.select().from(booksTable).orderBy(booksTable.createdAt);
  } catch (err) {
    logger.warn({ err }, "Drizzle fetch failed, falling back to Supabase API");
    // Fallback to Supabase REST API
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    // Map snake_case to camelCase if needed, but the schema seems to use snake_case for everything in the DB
    // actually drizzle schema uses camelCase for the JS objects.
    // I need to map them.
    return data.map(b => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      description: b.description,
      author: b.author,
      coverImage: b.cover_image,
      type: b.type,
      hardcopyPrice: b.hardcopy_price,
      ebookPrice: b.ebook_price,
      currency: b.currency,
      isLatest: b.is_latest,
      publishedYear: b.published_year,
      category: b.category,
      createdAt: new Date(b.created_at)
    }));
  }
}

export async function fetchLatestPodcasts(limit = 3) {
  try {
    return await db
      .select()
      .from(podcastsTable)
      .orderBy(desc(podcastsTable.publishedAt))
      .limit(limit);
  } catch (err) {
    logger.warn({ err }, "Drizzle fetch failed, falling back to Supabase API");
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      url: p.url,
      thumbnailUrl: p.thumbnail_url,
      duration: p.duration,
      publishedAt: new Date(p.published_at),
      createdAt: new Date(p.created_at)
    }));
  }
}
