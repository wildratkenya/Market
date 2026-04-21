import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";
import { z } from "zod";

const router: IRouter = Router();

const UpdateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  notes: z.string().nullable().optional(),
});

function serializeOrder(o: typeof ordersTable.$inferSelect) {
  return { ...o, createdAt: o.createdAt.toISOString() };
}

router.get("/orders", async (_req, res) => {
  const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  res.json(orders.map(serializeOrder));
});

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }
  const data = parsed.data;
  const [order] = await db
    .insert(ordersTable)
    .values({
      bookId: data.bookId,
      bookTitle: data.bookTitle,
      orderType: data.orderType,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone ?? null,
      deliveryAddress: data.deliveryAddress ?? null,
      deliveryCity: data.deliveryCity ?? null,
      notes: data.notes ?? null,
      status: "pending",
    })
    .returning();

  res.status(201).json(serializeOrder(order));
});

router.get("/orders/:id", async (req, res) => {
  const params = GetOrderParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(serializeOrder(order));
});

router.patch("/orders/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const parsed = UpdateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status", details: parsed.error.issues });
    return;
  }
  const updateData: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.notes !== undefined) {
    updateData.notes = parsed.data.notes;
  }
  const [order] = await db
    .update(ordersTable)
    .set(updateData)
    .where(eq(ordersTable.id, id))
    .returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(serializeOrder(order));
});

export default router;
