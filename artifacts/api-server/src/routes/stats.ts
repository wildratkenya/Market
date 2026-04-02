import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { booksTable, ordersTable, subscribersTable, podcastsTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res) => {
  const [booksCount] = await db.select({ count: sql<number>`count(*)::int` }).from(booksTable);
  const [ordersCount] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable);
  const [subscribersCount] = await db.select({ count: sql<number>`count(*)::int` }).from(subscribersTable);
  const [podcastsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(podcastsTable);

  res.json({
    totalBooks: booksCount.count,
    totalOrders: ordersCount.count,
    totalSubscribers: subscribersCount.count,
    totalPodcasts: podcastsCount.count,
  });
});

export default router;
