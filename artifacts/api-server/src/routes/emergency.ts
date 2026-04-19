import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, emergencyVisitsTable } from "@workspace/db";
import {
  CreateEmergencyVisitBody,
  UpdateEmergencyVisitBody,
} from "@workspace/api-zod";
import { getStaffNameMap } from "../lib/lookups";

const router: IRouter = Router();

/**
 * زیادکردنی ناوی پزیشک بۆ تۆمارەکانی بەشی فریاگوزاری
 */
async function expand(rows: (typeof emergencyVisitsTable.$inferSelect)[]) {
  const staffMap = await getStaffNameMap(
    rows.map((r) => r.assignedDoctorId).filter((x): x is number => x != null),
  );
  return rows.map((r) => ({
    id: r.id,
    patientName: r.patientName,
    patientId: r.patientId,
    triage: r.triage, // دۆخی فریاگوزاری (وەک: سوور بۆ مەترسیدار، سەوز بۆ ئاسایی)
    complaint: r.complaint, // سکاڵای نەخۆش
    arrivalAt: r.arrivalAt.toISOString(),
    status: r.status,
    assignedDoctorId: r.assignedDoctorId,
    assignedDoctorName: r.assignedDoctorId
      ? (staffMap.get(r.assignedDoctorId) ?? null)
      : null,
  }));
}

// وەرگرتنی لیستی هەموو فایلی نەخۆشەکانی بەشی فریاگوزاری
router.get("/emergency-visits", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(emergencyVisitsTable)
    .orderBy(desc(emergencyVisitsTable.arrivalAt));
  res.json(await expand(rows));
});

// تۆمارکردنی نەخۆشێکی نوێ لە بەشی فریاگوزاری
router.post("/emergency-visits", async (req, res): Promise<void> => {
  const parsed = CreateEmergencyVisitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(emergencyVisitsTable)
    .values({ ...parsed.data, status: "waiting" }) // دۆخی سەرەتایی وەک 'لە چاوەڕوانیدا'
    .returning();
  res.status(201).json((await expand([row]))[0]);
});

// ئەپدێتکردنی دۆخی چارەسەرکردنی نەخۆش یان گۆڕینی تریاج (Triage)
router.patch("/emergency-visits/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = UpdateEmergencyVisitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(emergencyVisitsTable)
    .set(parsed.data)
    .where(eq(emergencyVisitsTable.id, id))
    .returning();
    
  if (!row) {
    res.status(404).json({ error: "تۆمار نەدۆزرایەوە" });
    return;
  }
  res.json((await expand([row]))[0]);
});

export default router;
