import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { booksTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { GetBookParams } from "@workspace/api-zod";
import { z } from "zod";
import { requireEditor, requireSuperAdmin } from "../middleware/admin-auth";
import { fetchBooks } from "../lib/data";


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

function serializeBook(b: any) {
  let dateString: string;
  try {
    const rawDate = b.createdAt || b.created_at || new Date();
    const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
    dateString = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch {
    dateString = new Date().toISOString();
  }
  
  return {
    ...b,
    id: b.id || b.bookId,
    hardcopyPrice: b.hardcopyPrice != null ? Number(b.hardcopyPrice) : null,
    ebookPrice: b.ebookPrice != null ? Number(b.ebookPrice) : null,
    createdAt: dateString,
  };
}

router.get("/books", async (req, res) => {
  try {
    const { getBooks } = await import("../lib/data");
    const books = await getBooks();
    res.json(books.map(serializeBook));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

router.post("/books", requireEditor, async (req, res) => {
  try {
    const parsed = BookBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      return;
    }
    const data = parsed.data;
    const { insertBook } = await import("../lib/data");
    const book = await insertBook({
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
    });
    res.status(201).json(serializeBook(book));
  } catch (err) {
    res.status(500).json({ error: "Failed to create book" });
  }
});

router.get("/books/:id", async (req, res) => {
  try {
    const params = GetBookParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    
    const { supabase } = await import("../lib/supabase");
    const { data: book, error } = await supabase.from('books').select('*').eq('id', params.data.id).maybeSingle();
    
    if (error || !book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    
    res.json(serializeBook({
        ...book,
        coverImage: book.cover_image,
        hardcopyPrice: book.hardcopy_price,
        ebookPrice: book.ebook_price,
        isLatest: book.is_latest,
        publishedYear: book.published_year,
        createdAt: new Date(book.created_at)
    } as any));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

router.put("/books/:id", requireEditor, async (req, res) => {
  try {
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
    const { updateBook } = await import("../lib/data");
    const book = await updateBook(id, {
      title: data.title,
      subtitle: data.subtitle ?? null,
      description: data.description,
      author: data.author,
      coverImage: data.coverImage ?? null,
      type: data.type,
      hardcopyPrice: data.hardcopyPrice != null ? String(data.hardcopyPrice) : null,
      ebookPrice: data.ebook_price != null ? String(data.ebook_price) : null,
      currency: data.currency,
      isLatest: data.isLatest,
      publishedYear: data.publishedYear ?? null,
      category: data.category ?? null,
    });
    res.json(serializeBook(book));
  } catch (err) {
    res.status(500).json({ error: "Failed to update book" });
  }
});

router.delete("/books/:id", requireSuperAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const cascade = req.query.cascade === "true";

  if (!cascade) {
    const { supabase } = await import("../lib/supabase");
    const { data: orders } = await supabase.from("orders").select("id, customer_name, status").eq("book_id", id);
    if (orders && orders.length > 0) {
      res.status(409).json({
        error: "Cannot delete book with associated orders",
        hasOrders: true,
        orderCount: orders.length,
        orders: orders,
      });
      return;
    }
  }

  try {
    if (cascade) {
      const { supabase } = await import("../lib/supabase");
      const { error: orderError } = await supabase.from("orders").delete().eq("book_id", id);
      if (orderError) {
        console.error("Cascade delete orders error:", orderError);
        res.status(500).json({ error: "Failed to delete associated orders", detail: orderError.message });
        return;
      }
    }

    const { deleteBook } = await import("../lib/data");
    await deleteBook(id);
    res.json({ success: true, cascade });
  } catch (err) {
    console.error("Delete book error:", err);
    res.status(500).json({ error: "Failed to delete book", detail: err instanceof Error ? err.message : "Unknown error" });
  }
});


export default router;

