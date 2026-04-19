import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, staffTable } from "@workspace/db";
import { LoginBody } from "@workspace/api-zod";

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
  if (!user || user.password !== parsed.data.password) {
    res.status(401).json({ error: "ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە" });
    return;
  }
  res.json({
    token: `tok_${user.id}_${Date.now()}`,
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

router.get("/auth/me", async (req, res): Promise<void> => {
  const auth = req.header("authorization") ?? "";
  const m = auth.match(/^Bearer tok_(\d+)_/);
  if (!m) {
    res.status(401).json({ error: "نەناسراو" });
    return;
  }
  const id = Number(m[1]);
  const [user] = await db.select().from(staffTable).where(eq(staffTable.id, id));
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
      password: "demo",
    })),
  );
});

router.post("/auth/demo-login", async (req, res): Promise<void> => {
  const username = String(req.body?.username ?? "");
  const [user] = await db
    .select()
    .from(staffTable)
    .where(eq(staffTable.username, username));
  if (!user) {
    res.status(404).json({ error: "نەناسراو" });
    return;
  }
  res.json({
    token: `tok_${user.id}_${Date.now()}`,
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

export default router;
