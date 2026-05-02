import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";
import { z } from "zod";
import { requireAuth, requireEditor } from "../middleware/admin-auth";

const router: IRouter = Router();

const UpdateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  notes: z.string().nullable().optional(),
});

function serializeOrder(o: any) {
  let dateString: string;
  try {
    const rawDate = o.createdAt || o.created_at || new Date();
    const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
    dateString = isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch {
    dateString = new Date().toISOString();
  }
  return { 
    ...o, 
    id: o.id,
    createdAt: dateString 
  };
}

router.get("/orders", requireAuth, async (_req, res) => {
  try {
    const { getOrders } = await import("../lib/data");
    const orders = await getOrders();
    res.json(orders.map(o => ({
      ...o,
      createdAt: typeof o.createdAt === "string" ? o.createdAt : o.createdAt.toISOString()
    })));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const parsed = CreateOrderBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      return;
    }
    const data = parsed.data;
    const { insertOrder } = await import("../lib/data");
    const order = await insertOrder({
      bookId: data.bookId,
      bookTitle: data.bookTitle,
      orderType: data.orderType,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone ?? null,
      deliveryAddress: data.deliveryAddress ?? null,
      deliveryCity: data.deliveryCity ?? null,
      notes: data.notes ?? null,
      quantity: data.quantity ?? 1,
      totalAmount: data.totalAmount ?? null,
      vatAmount: data.vatAmount ?? null,
      status: "pending",
    });
    res.status(201).json(serializeOrder(order));
  } catch (err: any) {
    console.error("Order creation error:", err);
    res.status(500).json({ 
      error: "Internal server error", 
      message: err.message || "Unknown error during order saving",
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

router.get("/orders/:id", requireAuth, async (req, res) => {
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

router.patch("/orders/:id/status", requireEditor, async (req, res) => {
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
  try {
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
  } catch {
    try {
      const { supabase } = await import("../lib/supabase");
      const updateData: Record<string, unknown> = { status: parsed.data.status };
      if (parsed.data.notes !== undefined) {
        updateData.notes = parsed.data.notes;
      }
      const { data, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      res.json(serializeOrder(data));
    } catch (err) {
      console.error("Order status update error:", err);
      res.status(500).json({ error: "Failed to update order status" });
    }
  }
});

export default router;
