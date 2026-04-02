import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { podcastsTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/podcasts", async (_req, res) => {
  const podcasts = await db
    .select()
    .from(podcastsTable)
    .orderBy(desc(podcastsTable.publishedAt));
  res.json(
    podcasts.map((p) => ({
      ...p,
      publishedAt: p.publishedAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
    }))
  );
});

router.get("/podcasts/latest", async (_req, res) => {
  const podcasts = await db
    .select()
    .from(podcastsTable)
    .orderBy(desc(podcastsTable.publishedAt))
    .limit(3);
  res.json(
    podcasts.map((p) => ({
      ...p,
      publishedAt: p.publishedAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
    }))
  );
});

export default router;
