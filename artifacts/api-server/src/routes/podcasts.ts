import { Router, type IRouter } from "express";
import { fetchLatestPodcasts } from "../lib/data";

const router: IRouter = Router();

router.get("/podcasts", async (_req, res) => {
  try {
    const podcasts = await fetchLatestPodcasts(100);
    res.json(
      podcasts.map((p) => ({
        ...p,
        publishedAt: p.publishedAt.toISOString(),
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch podcasts" });
  }
});

router.get("/podcasts/latest", async (_req, res) => {
  try {
    const podcasts = await fetchLatestPodcasts(3);
    res.json(
      podcasts.map((p) => ({
        ...p,
        publishedAt: p.publishedAt.toISOString(),
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch latest podcasts" });
  }
});

export default router;
