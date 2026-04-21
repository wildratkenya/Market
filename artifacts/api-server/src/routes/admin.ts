import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { adminUsersTable } from "@workspace/db/schema";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { createAdminToken, verifyPassword, hashPassword } from "../lib/token";
import { requireAuth } from "../middleware/admin-auth";

const router: IRouter = Router();

const LoginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

router.post("/admin/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Login and password are required" });
    return;
  }
  const { login, password } = parsed.data;
  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(or(eq(adminUsersTable.email, login), eq(adminUsersTable.username, login)));

  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = createAdminToken({
    uid: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  });
});

router.get("/admin/me", requireAuth, async (req, res) => {
  const [user] = await db
    .select({ id: adminUsersTable.id, username: adminUsersTable.username, email: adminUsersTable.email, role: adminUsersTable.role })
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, req.adminUser!.uid));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.post("/admin/change-password", requireAuth, async (req, res) => {
  const parsed = ChangePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }
  const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, req.adminUser!.uid));
  if (!user || !verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }
  const newHash = hashPassword(parsed.data.newPassword);
  await db.update(adminUsersTable).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(adminUsersTable.id, user.id));
  res.json({ success: true });
});

export default router;
