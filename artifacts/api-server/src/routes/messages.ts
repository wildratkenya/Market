import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { messagesTable } from "@workspace/db/schema";
import { CreateMessageBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/messages", async (_req, res) => {
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

export default router;
