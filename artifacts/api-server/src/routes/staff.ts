import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, staffTable } from "@workspace/db";
import { CreateStaffBody, UpdateStaffBody } from "@workspace/api-zod";

const router: IRouter = Router();

function serialize(s: typeof staffTable.$inferSelect) {
  return {
    id: s.id,
    fullName: s.fullName,
    username: s.username,
    role: s.role,
    department: s.department,
    phone: s.phone,
    salary: s.salary,
    joinedAt: s.joinedAt.toISOString(),
  };
}

router.get("/staff", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(staffTable)
    .orderBy(desc(staffTable.joinedAt));
  res.json(rows.map(serialize));
});

router.post("/staff", async (req, res): Promise<void> => {
  const parsed = CreateStaffBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(staffTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(serialize(row));
});

router.patch("/staff/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = UpdateStaffBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(staffTable)
    .set(parsed.data)
    .where(eq(staffTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "ستاف نەدۆزرایەوە" });
    return;
  }
  res.json(serialize(row));
});

export default router;
