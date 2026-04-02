import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { booksTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { GetBookParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/books", async (req, res) => {
  const books = await db.select().from(booksTable).orderBy(booksTable.createdAt);
  const result = books.map((b) => ({
    ...b,
    hardcopyPrice: b.hardcopyPrice ? Number(b.hardcopyPrice) : null,
    ebookPrice: b.ebookPrice ? Number(b.ebookPrice) : null,
    createdAt: b.createdAt.toISOString(),
  }));
  res.json(result);
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
  res.json({
    ...book,
    hardcopyPrice: book.hardcopyPrice ? Number(book.hardcopyPrice) : null,
    ebookPrice: book.ebookPrice ? Number(book.ebookPrice) : null,
    createdAt: book.createdAt.toISOString(),
  });
});

export default router;
