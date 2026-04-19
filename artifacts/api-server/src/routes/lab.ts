import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, labTestsTable, invoicesTable } from "@workspace/db";
import { CreateLabTestBody, UpdateLabTestBody } from "@workspace/api-zod";
import { getPatientNameMap, getStaffNameMap } from "../lib/lookups";

const router: IRouter = Router();

/**
 * زیادکردنی زانیاری نەخۆش و پزیشک بۆ لیستی پشکنینەکان
 * چونکە لە داتابەیس تەنها ناسنامەکان (IDs) پاشەکەوت کراون
 */
async function expand(rows: (typeof labTestsTable.$inferSelect)[]) {
  const patientMap = await getPatientNameMap(rows.map((r) => r.patientId));
  const staffMap = await getStaffNameMap(rows.map((r) => r.doctorId));
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: patientMap.get(r.patientId) ?? "—",
    doctorId: r.doctorId,
    doctorName: staffMap.get(r.doctorId) ?? "—",
    testName: r.testName,
    category: r.category,
    requestedAt: r.requestedAt.toISOString(),
    status: r.status,
    result: r.result,
    normalRange: r.normalRange,
    price: r.price,
  }));
}

// وەرگرتنی لیستی هەموو پشکنینەکانی تاقیگە بەپێی کات
router.get("/lab-tests", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(labTestsTable)
    .orderBy(desc(labTestsTable.requestedAt));
  res.json(await expand(rows));
});

// داواکردنی پشکنینێکی نوێی تاقیگە بۆ نەخۆش
router.post("/lab-tests", async (req, res): Promise<void> => {
  const parsed = CreateLabTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(labTestsTable)
    .values({ ...parsed.data, status: "pending" }) // دۆخەکەی بە شێوەی سەرەتایی "لە چاوەڕوانیدایە"
    .returning();
  res.status(201).json((await expand([row]))[0]);
});

// ئەپدێتکردنی ئەنجامی پشکنین یان گۆڕینی دۆخەکەی
router.patch("/lab-tests/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = UpdateLabTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(labTestsTable)
    .set(parsed.data)
    .where(eq(labTestsTable.id, id))
    .returning();
    
  if (!row) {
    res.status(404).json({ error: "تاقیکردنەوە نەدۆزرایەوە" });
    return;
  }

  /**
   * خۆکارکردن: ئەگەر پشکنینەکە تەواو بوو (Completed)، 
   * راستەوخۆ پسوولەی پارە (Invoice) بۆ نەخۆشەکە دروست دەبێت لە بەشی ژمێریاری
   */
  if (parsed.data.status === "completed") {
    await db.insert(invoicesTable).values({
      patientId: row.patientId,
      items: `پشکنینی تاقیگە: ${row.testName}`,
      amount: row.price,
      paidAmount: 0,
      status: "unpaid",
    });
  }

  res.json((await expand([row]))[0]);
});

export default router;
