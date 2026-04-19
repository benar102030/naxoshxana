import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, vitalsTable } from "@workspace/db";

const router: IRouter = Router();

// وەرگرتنی هەموو نیشانە سەرەکییەکانی نەخۆشێکی دیاریکراو بۆ چارت
router.get("/patient/:patientId", async (req, res): Promise<void> => {
  const patientId = Number(req.params.patientId);
  const rows = await db
    .select()
    .from(vitalsTable)
    .where(eq(vitalsTable.patientId, patientId))
    .orderBy(desc(vitalsTable.recordedAt))
    .limit(50); // تەنها ٥٠ دانەی کۆتایی بۆ ئەوەی چارتەکە قەرەباڵغ نەبێت

  // گۆڕینی کاتەکان بۆ شێوازی ISO
  res.json(rows.reverse().map(r => ({
    ...r,
    recordedAt: r.recordedAt.toISOString()
  })));
});

// تۆمارکردنی نیشانەی سەرەکی نوێ بۆ نەخۆش
router.post("/", async (req, res): Promise<void> => {
  const { patientId, heartRate, bloodPressure, temperature, spO2, respiratoryRate, recordedBy } = req.body;
  
  const [row] = await db
    .insert(vitalsTable)
    .values({
      patientId: Number(patientId),
      heartRate: heartRate ? Number(heartRate) : null,
      bloodPressure,
      temperature: temperature ? Number(temperature) : null,
      spO2: spO2 ? Number(spO2) : null,
      respiratoryRate: respiratoryRate ? Number(respiratoryRate) : null,
      recordedBy: recordedBy ? Number(recordedBy) : null,
    })
    .returning();
    
  res.status(201).json({
    ...row,
    recordedAt: row.recordedAt.toISOString()
  });
});

export default router;
