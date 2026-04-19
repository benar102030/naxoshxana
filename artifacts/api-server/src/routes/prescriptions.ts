import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, prescriptionsTable } from "@workspace/db";
import { CreatePrescriptionBody } from "@workspace/api-zod";
import { getPatientNameMap, getStaffNameMap } from "../lib/lookups";

const router: IRouter = Router();

/**
 * زیادکردنی زانیاری نەخۆش و پزیشک بۆ لیستی ڕەچەتەکان
 */
async function expand(rows: (typeof prescriptionsTable.$inferSelect)[]) {
  const patientMap = await getPatientNameMap(rows.map((r) => r.patientId));
  const staffMap = await getStaffNameMap(rows.map((r) => r.doctorId));
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: patientMap.get(r.patientId) ?? "—",
    doctorId: r.doctorId,
    doctorName: staffMap.get(r.doctorId) ?? "—",
    medicationName: r.medicationName, // ناوی دەرمان
    dosage: r.dosage, // ژەمە دەرمان (بۆ نموونە: ٥٠٠ ملگم)
    duration: r.duration, // ماوەی بەکارهێنان (بۆ نموونە: ٧ ڕۆژ)
    notes: r.notes, // ڕێنمایی زیادە بۆ بەکارهێنان
    prescribedAt: r.prescribedAt.toISOString(),
  }));
}

// وەرگرتنی لیستی گشتی هەموو ڕەچەتە پزیشکییەکان
router.get("/prescriptions", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(prescriptionsTable)
    .orderBy(desc(prescriptionsTable.prescribedAt));
  res.json(await expand(rows));
});

// تۆمارکردنی ڕەچەتەیەکی نوێ بۆ نەخۆش لەلایەن پزیشکەوە
router.post("/prescriptions", async (req, res): Promise<void> => {
  const parsed = CreatePrescriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(prescriptionsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json((await expand([row]))[0]);
});

export default router;
