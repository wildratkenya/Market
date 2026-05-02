import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sitePagesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireEditor } from "../middleware/admin-auth";

const router: IRouter = Router();

const SitePageBodySchema = z.object({
  pageName: z.string().min(1).optional(),
  pageTitle: z.string().min(1).optional(),
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
    const { supabase } = await import("../lib/supabase");
    const { data, error } = await supabase.from("site_pages").select("*").order("page_name");
    if (error) throw error;
    res.json((data || []).map(serializePage));
  } catch (err) {
    console.error("Pages fetch error:", err);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

router.get("/pages/:name", async (req, res) => {
  try {
    const { supabase } = await import("../lib/supabase");
    const { data, error } = await supabase.from("site_pages").select("*").eq("page_name", req.params.name).single();
    if (error) {
      res.status(404).json({ error: "Page not found" });
      return;
    }
    res.json(serializePage(data));
  } catch (err) {
    console.error("Page fetch error:", err);
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
    const { supabase } = await import("../lib/supabase");
    const snakeData: Record<string, any> = {};
    if (parsed.data.pageName !== undefined) snakeData.page_name = parsed.data.pageName;
    if (parsed.data.pageTitle !== undefined) snakeData.page_title = parsed.data.pageTitle;
    if (parsed.data.heroTitle !== undefined) snakeData.hero_title = parsed.data.heroTitle;
    if (parsed.data.heroSubtitle !== undefined) snakeData.hero_subtitle = parsed.data.heroSubtitle;
    if (parsed.data.heroDescription !== undefined) snakeData.hero_description = parsed.data.heroDescription;
    if (parsed.data.heroImage !== undefined) snakeData.hero_image = parsed.data.heroImage;
    if (parsed.data.heroButton !== undefined) snakeData.hero_button = parsed.data.heroButton;
    if (parsed.data.heroButtonText !== undefined) snakeData.hero_button_text = parsed.data.heroButtonText;
    if (parsed.data.bodyContent !== undefined) snakeData.body_content = parsed.data.bodyContent;
    if (parsed.data.footerContent !== undefined) snakeData.footer_content = parsed.data.footerContent;
    if (parsed.data.phone !== undefined) snakeData.phone = parsed.data.phone;
    if (parsed.data.email !== undefined) snakeData.email = parsed.data.email;
    if (parsed.data.address !== undefined) snakeData.address = parsed.data.address;
    if (parsed.data.socialLinks !== undefined) snakeData.social_links = parsed.data.socialLinks;
    const { data, error } = await supabase.from("site_pages").update(snakeData).eq("page_name", req.params.name).select().single();
    if (error) throw error;
    res.json(serializePage(data));
  } catch (err) {
    console.error("Page update error:", err);
    res.status(500).json({ error: "Failed to update page" });
  }
});

export default router;


