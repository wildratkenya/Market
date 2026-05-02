import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { subscribersTable } from "@workspace/db/schema";
import { CreateSubscriberBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/admin-auth";

const router: IRouter = Router();

router.get("/subscribers", requireAuth, async (_req, res) => {
  try {
    const { getSubscribers } = await import("../lib/data");
    const subs = await getSubscribers();
    res.json(
      subs.map((s) => ({
        ...s,
        subscribedAt: typeof s.createdAt === "string" ? s.createdAt : s.createdAt.toISOString()
      }))
    );
  } catch (err) {
    console.error("Subscribers error:", JSON.stringify(err)); res.status(500).json({ error: "Internal server error", detail: err instanceof Error ? err.message : JSON.stringify(err) });
  }
});

router.post("/subscribers", async (req, res) => {
  const parsed = CreateSubscriberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }
  const data = parsed.data;

  const { insertSubscriber } = await import("../lib/data");
  const subscriber = await insertSubscriber({
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      wantsWhatsapp: data.wantsWhatsapp,
      whatsappApproved: false,
    });

  res.status(201).json(subscriber);
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


