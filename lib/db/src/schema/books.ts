import { pgTable, serial, text, boolean, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookTypeEnum = pgEnum("book_type", ["hardcopy", "ebook", "both"]);

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description").notNull(),
  author: text("author").notNull().default("Jamuhuri Gachoroba"),
  coverImage: text("cover_image"),
  type: bookTypeEnum("type").notNull().default("both"),
  hardcopyPrice: numeric("hardcopy_price", { precision: 10, scale: 2 }),
  ebookPrice: numeric("ebook_price", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("KES"),
  isLatest: boolean("is_latest").notNull().default(false),
  publishedYear: integer("published_year"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookSchema = createInsertSchema(booksTable).omit({ id: true, createdAt: true });
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;
