import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { adminUsersTable } from "@workspace/db/schema";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { createAdminToken, verifyPassword, hashPassword } from "../lib/token";
import { requireAuth } from "../middleware/admin-auth";
import { logger } from "../lib/logger";

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
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Login and password are required" });
      return;
    }
    const { login, password } = parsed.data;
    const { verifyAdminCredentials } = await import("../lib/data");
    const user = await verifyAdminCredentials(login);

    if (!user) {
      logger.warn({ login }, "Login failed: User not found");
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      logger.warn({ login, hashPrefix: user.passwordHash.slice(0, 4) }, "Login failed: Password mismatch");
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
  } catch (err) {
    logger.error({ err }, "Login error");
    res.status(500).json({ error: "Internal server error during login" });
  }
});

router.get("/admin/me", requireAuth, async (req, res) => {
  try {
    const { supabase } = await import("../lib/supabase");
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, username, email, role")
      .eq("username", req.adminUser!.username)
      .limit(1)
      .single();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(data);
  } catch (err) {
    logger.error({ err }, "Error in /admin/me");
    res.status(500).json({ error: "Internal server error" });
  }
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

// User Management (Super Admin only)
router.get("/admin/users", requireAuth, async (req, res) => {
  if (req.adminUser?.role !== "super_admin") {
    res.status(403).json({ error: "Super admin required" });
    return;
  }
  const users = await db.select().from(adminUsersTable);
  res.json(users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role, createdAt: u.createdAt })));
});

router.post("/admin/users", requireAuth, async (req, res) => {
  if (req.adminUser?.role !== "super_admin") {
    res.status(403).json({ error: "Super admin required" });
    return;
  }
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }
  
  const [user] = await db.insert(adminUsersTable).values({
    username,
    email,
    passwordHash: hashPassword(password),
    role: role as any,
  }).returning();
  
  res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
});

router.delete("/admin/users/:id", requireAuth, async (req, res) => {
  if (req.adminUser?.role !== "super_admin") {
    res.status(403).json({ error: "Super admin required" });
    return;
  }
  const id = Number(req.params.id);
  if (id === req.adminUser.uid) {
    res.status(400).json({ error: "Cannot delete yourself" });
    return;
  }
  await db.delete(adminUsersTable).where(eq(adminUsersTable.id, id));
  res.json({ success: true });
});

// Emergency Reset Route
router.get("/force-admin-sync", async (req, res) => {
  try {
    const { forceResetAdmin } = await import("../lib/seed");
    await forceResetAdmin();
    res.send("Admin credentials synced successfully for user: admin / Jamuhuri. Please try logging in again.");
  } catch (err) {
    res.status(500).send('Sync failed: ' + err.message);
  }
});

export default router;


