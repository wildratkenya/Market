import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { blogsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireEditor, requireSuperAdmin } from "../middleware/admin-auth";

const router: IRouter = Router();

const BlogBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverImage: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  published: z.boolean().default(true),
});

function serializeBlog(b: any) {
  const rawDate = b.createdAt || b.created_at || new Date();
  const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
  const dateString = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  return {
    ...b,
    coverImage: b.coverImage || b.cover_image,
    publishedAt: b.publishedAt || b.published_at ? (b.publishedAt instanceof Date ? b.publishedAt.toISOString() : b.published_at) : null,
    createdAt: dateString,
    updatedAt: b.updatedAt || b.updated_at ? (b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updated_at) : null,
  };
}

router.get("/blogs", async (_req, res) => {
  try {
    const { getBlogs } = await import("../lib/data");
    const blogs = await getBlogs();
    res.json(blogs.map(serializeBlog));
  } catch {
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

router.get("/blogs/latest", async (_req, res) => {
  try {
    const { getLatestBlogs } = await import("../lib/data");
    const blogs = await getLatestBlogs(6);
    res.json(blogs.map(serializeBlog));
  } catch {
    res.status(500).json({ error: "Failed to fetch latest blog posts" });
  }
});

router.get("/blogs/:id", async (req, res) => {
  try {
    const { getBlog } = await import("../lib/data");
    const blog = await getBlog(req.params.id);
    if (!blog) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }
    res.json(serializeBlog(blog));
  } catch {
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

router.post("/blogs", requireEditor, async (req, res) => {
  try {
    const parsed = BlogBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      return;
    }
    const { insertBlog } = await import("../lib/data");
    const blog = await insertBlog(parsed.data);
    res.status(201).json(serializeBlog(blog));
  } catch {
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

router.put("/blogs/:id", requireEditor, async (req, res) => {
  try {
    const parsed = BlogBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      return;
    }
    const { updateBlog } = await import("../lib/data");
    const blog = await updateBlog(req.params.id, parsed.data);
    res.json(serializeBlog(blog));
  } catch {
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

router.delete("/blogs/:id", requireSuperAdmin, async (req, res) => {
  try {
    const { deleteBlog } = await import("../lib/data");
    await deleteBlog(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

export default router;
