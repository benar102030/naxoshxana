import { Router, type IRouter } from "express";
import { eq, desc, or, isNull } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";

const router: IRouter = Router();

// وەرگرتنی هەموو ئاگادارکردنەوەکانی کارمەندێکی دیاریکراو یان ئەوانەی بۆ هەمووانن
router.get("/staff/:staffId", async (req, res): Promise<void> => {
  const staffId = Number(req.params.staffId);
  const rows = await db
    .select()
    .from(notificationsTable)
    .where(
      or(
        eq(notificationsTable.staffId, staffId),
        isNull(notificationsTable.staffId) // ئاگادارکردنەوە گشتییەکان
      )
    )
    .orderBy(desc(notificationsTable.createdAt))
    .limit(20);

  res.json(rows.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString()
  })));
});

// گۆڕینی دۆخی ئاگادارکردنەوە بۆ "خوێندراوەتەوە"
router.patch("/:id/read", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, id))
    .returning();
    
  if (!row) {
    res.status(404).json({ error: "ئاگادارکردنەوە نەدۆزرایەوە" });
    return;
  }
  
  res.json({
    ...row,
    createdAt: row.createdAt.toISOString()
  });
});

// دروستکردنی ئاگادارکردنەوەیەکی نوێ (بۆ نمونە کاتێک دەرمان کەم دەبێت)
router.post("/", async (req, res): Promise<void> => {
  const { staffId, title, message, type } = req.body;
  const [row] = await db
    .insert(notificationsTable)
    .values({
      staffId: staffId ? Number(staffId) : null,
      title,
      message,
      type: type || "info",
    })
    .returning();
    
  res.status(201).json({
    ...row,
    createdAt: row.createdAt.toISOString()
  });
});

export default router;
