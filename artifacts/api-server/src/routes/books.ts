import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { booksTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { GetBookParams } from "@workspace/api-zod";
import { z } from "zod";

const router: IRouter = Router();

const BookBodySchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  description: z.string().min(1),
  author: z.string().min(1),
  coverImage: z.string().nullable().optional(),
  type: z.enum(["hardcopy", "ebook", "both"]),
  hardcopyPrice: z.number().nullable().optional(),
  ebookPrice: z.number().nullable().optional(),
  currency: z.string().default("KES"),
  isLatest: z.boolean().default(false),
  publishedYear: z.number().int().nullable().optional(),
  category: z.string().nullable().optional(),
});

function serializeBook(b: typeof booksTable.$inferSelect) {
  return {
    ...b,
    hardcopyPrice: b.hardcopyPrice ? Number(b.hardcopyPrice) : null,
    ebookPrice: b.ebookPrice ? Number(b.ebookPrice) : null,
    createdAt: b.createdAt.toISOString(),
  };
}

router.get("/books", async (req, res) => {
  const books = await db.select().from(booksTable).orderBy(booksTable.createdAt);
  res.json(books.map(serializeBook));
});

router.post("/books", async (req, res) => {
  const parsed = BookBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }
  const data = parsed.data;
  const [book] = await db
    .insert(booksTable)
    .values({
      title: data.title,
      subtitle: data.subtitle ?? null,
      description: data.description,
      author: data.author,
      coverImage: data.coverImage ?? null,
      type: data.type,
      hardcopyPrice: data.hardcopyPrice != null ? String(data.hardcopyPrice) : null,
      ebookPrice: data.ebookPrice != null ? String(data.ebookPrice) : null,
      currency: data.currency,
      isLatest: data.isLatest,
      publishedYear: data.publishedYear ?? null,
      category: data.category ?? null,
    })
    .returning();
  res.status(201).json(serializeBook(book));
});

router.get("/books/:id", async (req, res) => {
  const params = GetBookParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, params.data.id));
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json(serializeBook(book));
});

router.put("/books/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const parsed = BookBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }
  const data = parsed.data;
  const [book] = await db
    .update(booksTable)
    .set({
      title: data.title,
      subtitle: data.subtitle ?? null,
      description: data.description,
      author: data.author,
      coverImage: data.coverImage ?? null,
      type: data.type,
      hardcopyPrice: data.hardcopyPrice != null ? String(data.hardcopyPrice) : null,
      ebookPrice: data.ebookPrice != null ? String(data.ebookPrice) : null,
      currency: data.currency,
      isLatest: data.isLatest,
      publishedYear: data.publishedYear ?? null,
      category: data.category ?? null,
    })
    .where(eq(booksTable.id, id))
    .returning();
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json(serializeBook(book));
});

router.delete("/books/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [book] = await db.delete(booksTable).where(eq(booksTable.id, id)).returning();
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
