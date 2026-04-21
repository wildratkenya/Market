import type { Request, Response, NextFunction } from "express";
import { verifyAdminToken, type AdminTokenPayload } from "../lib/token";

declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminTokenPayload;
    }
  }
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyAdminToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  req.adminUser = payload;
  next();
}

export function requireEditor(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.adminUser || req.adminUser.role === "readonly") {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  });
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.adminUser || req.adminUser.role !== "super_admin") {
      res.status(403).json({ error: "Super admin required" });
      return;
    }
    next();
  });
}
