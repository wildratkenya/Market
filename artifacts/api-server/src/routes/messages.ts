import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { messagesTable } from "@workspace/db/schema";
import { CreateMessageBody } from "@workspace/api-zod";
import { requireAuth } from "../middleware/admin-auth";

const router: IRouter = Router();

router.get("/messages", requireAuth, async (_req, res) => {
  const msgs = await db.select().from(messagesTable).orderBy(messagesTable.createdAt);
  res.json(
    msgs.map((m) => ({
      ...m,
      readAt: m.readAt ? m.readAt.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
    }))
  );
});

router.post("/messages", async (req, res) => {
  const parsed = CreateMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }
  const data = parsed.data;
  const [msg] = await db
    .insert(messagesTable)
    .values({
      type: data.type,
      subject: data.subject,
      body: data.body,
      senderEmail: data.senderEmail ?? null,
    })
    .returning();

  res.status(201).json({
    ...msg,
    readAt: msg.readAt ? msg.readAt.toISOString() : null,
    createdAt: msg.createdAt.toISOString(),
  });
});

router.patch("/messages/:id/read", requireAuth, async (req, res) => {
  if (req.adminUser?.role === "readonly") {
    res.status(403).json({ error: "Insufficient permissions" });
    return;
  }
  
  const id = Number(req.params.id);
  const [msg] = await db
    .update(messagesTable)
    .set({ readAt: new Date() })
    .where(eq(messagesTable.id, id))
    .returning();
    
  if (!msg) {
    res.status(404).json({ error: "Message not found" });
    return;
  }
  
  res.json({
    ...msg,
    readAt: msg.readAt ? msg.readAt.toISOString() : null,
    createdAt: msg.createdAt.toISOString(),
  });
});

export default router;
