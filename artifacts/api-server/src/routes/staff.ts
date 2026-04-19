import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, staffTable } from "@workspace/db";
import { CreateStaffBody, UpdateStaffBody } from "@workspace/api-zod";

const router: IRouter = Router();

/**
 * ڕێکخستنی زانیارییەکانی کارمەند بۆ ناردنەوە بۆ فرۆنتێند
 * هەندێک زانیاری وەک مێژوو دەگۆڕدرێت بۆ دەق (String)
 */
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

// وەرگرتنی لیستی هەموو کارمەندانی نەخۆشخانە
router.get("/staff", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(staffTable)
    .orderBy(desc(staffTable.joinedAt));
  res.json(rows.map(serialize));
});

/**
 * زیادکردنی کارمەندێکی نوێ
 * وشەی نهێنی کارمەندەکە پێش پاشەکەوتکردن لێڵ (Hash) دەکرێت بۆ پاراستنی
 */
router.post("/staff", async (req, res): Promise<void> => {
  const parsed = CreateStaffBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  
  const [row] = await db
    .insert(staffTable)
    .values({ 
      ...parsed.data, 
      password: bcrypt.hashSync(parsed.data.password, 10) // تەمپڵکردنی وشەی نهێنی
    })
    .returning();
    
  res.status(201).json(serialize(row));
});

// گۆڕینی زانیارییەکانی کارمەندێکی دیاریکراو
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

/**
 * سڕینەوەی کارمەند (تەنها ئادمین)
 */
router.delete("/staff/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db
    .delete(staffTable)
    .where(eq(staffTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "ستاف نەدۆزرایەوە" });
    return;
  }
  res.json({ success: true, message: "کارمەند سڕایەوە" });
});

export default router;
