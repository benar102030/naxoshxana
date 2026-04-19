import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import "express";

export type Role =
  | "admin"
  | "manager"
  | "doctor"
  | "nurse"
  | "pharmacist"
  | "cashier"
  | "labtech"
  | "radtech";

export interface JwtPayload {
  sub: number;
  username: string;
  role: Role;
  fullName: string;
}

const SECRET = (() => {
  const s = process.env.JWT_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set (>=32 chars) in production");
  }
  console.warn("[auth] JWT_SECRET not set — using ephemeral dev secret");
  return "dev-only-ephemeral-secret-do-not-use-in-prod-32chars";
})();
const EXPIRY = "12h";

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as unknown as JwtPayload;
  } catch {
    return null;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * مێدڵوێر بۆ ناچارکردنی بەکارهێنەر کە چووبێتە ژوورەوە (Authentication)
 */
export const requireAuth: RequestHandler = (req, res, next) => {
  const auth = req.header("authorization") ?? "";
  const m = auth.match(/^Bearer\s+(.+)$/);
  if (!m) {
    res.status(401).json({ error: "نەناسراو" });
    return;
  }
  const payload = verifyToken(m[1]);
  if (!payload) {
    res.status(401).json({ error: "تۆکنی نادروست یان بەسەرچوو" });
    return;
  }
  req.user = payload;
  next();
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: "نەناسراو" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "ڕێگەپێدراو نییە" });
      return;
    }
    next();
  };
}
