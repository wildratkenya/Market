import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sitePagesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireEditor } from "../middleware/admin-auth";

const router: IRouter = Router();

const SitePageBodySchema = z.object({
  pageName: z.string().min(1),
  pageTitle: z.string().min(1),
  heroTitle: z.string().nullable().optional(),
  heroSubtitle: z.string().nullable().optional(),
  heroDescription: z.string().nullable().optional(),
  heroImage: z.string().nullable().optional(),
  heroButton: z.string().nullable().optional(),
  heroButtonText: z.string().nullable().optional(),
  bodyContent: z.string().nullable().optional(),
  footerContent: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  socialLinks: z.string().nullable().optional(),
});

function serializePage(p: any) {
  return {
    ...p,
    pageTitle: p.pageTitle || p.page_title,
    pageName: p.pageName || p.page_name,
    heroTitle: p.heroTitle || p.hero_title,
    heroSubtitle: p.heroSubtitle || p.hero_subtitle,
    heroDescription: p.heroDescription || p.hero_description,
    heroImage: p.heroImage || p.hero_image,
    heroButton: p.heroButton || p.hero_button,
    heroButtonText: p.heroButtonText || p.hero_button_text,
    bodyContent: p.bodyContent || p.body_content,
    footerContent: p.footerContent || p.footer_content,
    createdAt: p.createdAt || p.created_at,
    updatedAt: p.updatedAt || p.updated_at,
  };
}

router.get("/pages", requireAuth, async (_req, res) => {
  try {
    const pages = await db.select().from(sitePagesTable).orderBy(sitePagesTable.pageName);
    res.json(pages.map(serializePage));
  } catch {
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

router.get("/pages/:name", async (req, res) => {
  try {
    const [page] = await db.select().from(sitePagesTable).where(eq(sitePagesTable.pageName, req.params.name));
    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    res.json(serializePage(page));
  } catch {
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

router.put("/pages/:name", requireEditor, async (req, res) => {
  try {
    const parsed = SitePageBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      return;
    }
    const { upsertPage } = await import("../lib/data");
    const page = await upsertPage(req.params.name, parsed.data);
    res.json(serializePage(page));
  } catch (err) {
    res.status(500).json({ error: "Failed to update page" });
  }
});

export default router;
