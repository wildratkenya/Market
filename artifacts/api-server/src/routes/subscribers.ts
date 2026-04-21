import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { subscribersTable } from "@workspace/db/schema";
import { CreateSubscriberBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/admin-auth";

const router: IRouter = Router();

router.get("/subscribers", requireAuth, async (_req, res) => {
  const subs = await db.select().from(subscribersTable).orderBy(subscribersTable.subscribedAt);
  res.json(
    subs.map((s) => ({ ...s, subscribedAt: s.subscribedAt.toISOString() }))
  );
});

router.post("/subscribers", async (req, res) => {
  const parsed = CreateSubscriberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }
  const data = parsed.data;

  const [existing] = await db
    .select()
    .from(subscribersTable)
    .where(eq(subscribersTable.email, data.email));

  if (existing) {
    res.status(409).json({ error: "Already subscribed with this email" });
    return;
  }

  const [subscriber] = await db
    .insert(subscribersTable)
    .values({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      wantsWhatsapp: data.wantsWhatsapp,
      whatsappApproved: false,
    })
    .returning();

  res.status(201).json({ ...subscriber, subscribedAt: subscriber.subscribedAt.toISOString() });
});

router.patch("/subscribers/:id/whatsapp", requireAuth, async (req, res) => {
  if (req.adminUser?.role === "readonly") {
    res.status(403).json({ error: "Insufficient permissions" });
    return;
  }
  
  const id = Number(req.params.id);
  const { approved } = req.body;
  
  const [subscriber] = await db
    .update(subscribersTable)
    .set({ whatsappApproved: !!approved })
    .where(eq(subscribersTable.id, id))
    .returning();
    
  if (!subscriber) {
    res.status(404).json({ error: "Subscriber not found" });
    return;
  }
  
  res.json({ ...subscriber, subscribedAt: subscriber.subscribedAt.toISOString() });
});

export default router;
