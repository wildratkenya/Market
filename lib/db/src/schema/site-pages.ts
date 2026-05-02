import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sitePagesTable = pgTable("site_pages", {
  id: serial("id").primaryKey(),
  pageName: text("page_name").notNull().unique(),
  pageTitle: text("page_title").notNull(),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  heroDescription: text("hero_description"),
  heroImage: text("hero_image"),
  heroButton: text("hero_button"),
  heroButtonText: text("hero_button_text"),
  bodyContent: text("body_content"),
  footerContent: text("footer_content"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  socialLinks: text("social_links"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSitePageSchema = createInsertSchema(sitePagesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSitePage = z.infer<typeof insertSitePageSchema>;
export type SitePage = typeof sitePagesTable.$inferSelect;
