import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/orders", async (_req, res) => {
  const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  res.json(
    orders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() }))
  );
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

  res.status(201).json({ ...order, createdAt: order.createdAt.toISOString() });
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
  res.json({ ...order, createdAt: order.createdAt.toISOString() });
});

export default router;
