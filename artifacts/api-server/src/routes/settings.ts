import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireSuperAdmin } from "../middleware/admin-auth";

const router: IRouter = Router();

const UpdateSettingsSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

router.get("/settings", requireAuth, async (_req, res) => {
  try {
    const rows = await db.select().from(settingsTable);
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    try {
      const { supabase } = await import("../lib/supabase");
      const { data } = await supabase.from("settings").select("*");
      const settings: Record<string, string> = {};
      for (const row of data || []) {
        settings[row.key] = row.value;
      }
      res.json(settings);
    } catch {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  }
});

router.put("/settings", requireSuperAdmin, async (req, res) => {
  try {
    const parsed = z.array(UpdateSettingsSchema).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }
    const entries = parsed.data;
    const results: Record<string, string> = {};
    for (const entry of entries) {
      const [row] = await db
        .insert(settingsTable)
        .values({ key: entry.key, value: entry.value })
        .onConflictDoUpdate({ target: settingsTable.key, set: { value: entry.value, updatedAt: new Date() } })
        .returning();
      results[row.key] = row.value;
    }
    res.json(results);
  } catch (err) {
    try {
      const { supabase } = await import("../lib/supabase");
      const entries = req.body as Array<{ key: string; value: string }>;
      const results: Record<string, string> = {};
      for (const entry of entries) {
        const { data: existing } = await supabase
          .from("settings")
          .select("*")
          .eq("key", entry.key)
          .maybeSingle();
        if (existing) {
          const { data } = await supabase
            .from("settings")
            .update({ value: entry.value, updated_at: new Date().toISOString() })
            .eq("key", entry.key)
            .select()
            .single();
          if (data) results[data.key] = data.value;
        } else {
          const { data } = await supabase
            .from("settings")
            .insert({ key: entry.key, value: entry.value })
            .select()
            .single();
          if (data) results[data.key] = data.value;
        }
      }
      res.json(results);
    } catch (fallbackErr) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  }
});

export default router;
