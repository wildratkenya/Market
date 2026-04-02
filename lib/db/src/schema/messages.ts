import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const messageTypeEnum = pgEnum("message_type", ["order", "contact", "subscription"]);

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  type: messageTypeEnum("type").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  senderEmail: text("sender_email"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true, readAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
