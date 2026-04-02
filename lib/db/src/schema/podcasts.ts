import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const podcastsTable = pgTable("podcasts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  audioUrl: text("audio_url"),
  buzzsproutUrl: text("buzzsprout_url"),
  duration: text("duration"),
  episodeNumber: integer("episode_number"),
  season: integer("season"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  thumbnailUrl: text("thumbnail_url"),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPodcastSchema = createInsertSchema(podcastsTable).omit({ id: true, createdAt: true });
export type InsertPodcast = z.infer<typeof insertPodcastSchema>;
export type Podcast = typeof podcastsTable.$inferSelect;
