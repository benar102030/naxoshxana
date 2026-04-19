import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, opdVisitsTable, invoicesTable } from "@workspace/db";
import { CreateOpdVisitBody, UpdateOpdVisitBody } from "@workspace/api-zod";
import { getPatientNameMap, getStaffNameMap } from "../lib/lookups";

const router: IRouter = Router();

/**
 * زیادکردنی زانیاری نەخۆش و پزیشک بۆ لیستی سەردانەکان
 */
async function expand(rows: (typeof opdVisitsTable.$inferSelect)[]) {
  const patientMap = await getPatientNameMap(rows.map((r) => r.patientId));
  const staffMap = await getStaffNameMap(rows.map((r) => r.doctorId));
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: patientMap.get(r.patientId) ?? "—",
    doctorId: r.doctorId,
    doctorName: staffMap.get(r.doctorId) ?? "—",
    appointmentAt: r.appointmentAt.toISOString(),
    complaint: r.complaint,
    diagnosis: r.diagnosis,
    status: r.status,
    fee: r.fee,
    createdAt: r.createdAt.toISOString(),
  }));
}

// وەرگرتنی لیستی هەموو سەردانەکانی نۆرینگەی دەرەکی (OPD)
router.get("/opd-visits", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(opdVisitsTable)
    .orderBy(desc(opdVisitsTable.appointmentAt));
  res.json(await expand(rows));
});

// تۆمارکردنی کاتی سەردانێکی نوێ بۆ نەخۆش
router.post("/opd-visits", async (req, res): Promise<void> => {
  const parsed = CreateOpdVisitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(opdVisitsTable)
    .values({
      patientId: parsed.data.patientId,
      doctorId: parsed.data.doctorId,
      appointmentAt: new Date(parsed.data.appointmentAt),
      complaint: parsed.data.complaint,
      fee: parsed.data.fee,
      status: "scheduled", // دۆخی سەرەتایی وەک خشتەبۆکراو
    })
    .returning();
  res.status(201).json((await expand([row]))[0]);
});

// ئەپدێتکردنی زانیاری سەردان یان گۆڕینی دۆخەکە بۆ 'بینراو'
router.patch("/opd-visits/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = UpdateOpdVisitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(opdVisitsTable)
    .set(parsed.data)
    .where(eq(opdVisitsTable.id, id))
    .returning();
    
  if (!row) {
    res.status(404).json({ error: "سەردانی کلینیک نەدۆزرایەوە" });
    return;
  }

  /**
   * خۆکارکردن: کاتێک نەخۆشەکە لە لایەن پزیشکەوە بینرا و دۆخەکەی بوو بە 'Done'
   * راستەوخۆ پسوولەی پارەی پشکنین (Invoice) بۆ دروست دەبێت
   */
  if (parsed.data.status === "done") {
    await db.insert(invoicesTable).values({
      patientId: row.patientId,
      items: `سەردانی پزیشک (OPD Visit)`,
      amount: row.fee,
      paidAmount: 0,
      status: "unpaid",
    });
  }

  res.json((await expand([row]))[0]);
});

export default router;
