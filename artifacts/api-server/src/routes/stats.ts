import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { booksTable, ordersTable, subscribersTable, podcastsTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";
import { requireAuth } from "../middleware/admin-auth";

const router: IRouter = Router();

router.get("/stats/summary", requireAuth, async (_req, res) => {
  try {
    const { getStats } = await import("../lib/data");
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
