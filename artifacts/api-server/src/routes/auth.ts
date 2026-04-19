import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, staffTable } from "@workspace/db";
import { LoginBody } from "@workspace/api-zod";
import { signToken, requireAuth, type Role } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db
    .select()
    .from(staffTable)
    .where(eq(staffTable.username, parsed.data.username));
  if (!user) {
    res.status(401).json({ error: "ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە" });
    return;
  }
  const ok = user.password.startsWith("$2")
    ? await bcrypt.compare(parsed.data.password, user.password)
    : user.password === parsed.data.password;
  if (!ok) {
    res.status(401).json({ error: "ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە" });
    return;
  }
  const token = signToken({
    sub: user.id,
    username: user.username,
    role: user.role as Role,
    fullName: user.fullName,
  });
  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      department: user.department,
      phone: user.phone,
      salary: user.salary,
      joinedAt: user.joinedAt.toISOString(),
    },
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(staffTable)
    .where(eq(staffTable.id, req.user!.sub));
  if (!user) {
    res.status(401).json({ error: "نەناسراو" });
    return;
  }
  res.json({
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    role: user.role,
    department: user.department,
    phone: user.phone,
    salary: user.salary,
    joinedAt: user.joinedAt.toISOString(),
  });
});

router.get("/auth/users", async (_req, res): Promise<void> => {
  const users = await db.select().from(staffTable);
  res.json(
    users.map((u) => ({
      username: u.username,
      fullName: u.fullName,
      role: u.role,
    })),
  );
});

export default router;
