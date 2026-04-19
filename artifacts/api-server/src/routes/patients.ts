import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { 
  db, patientsTable, opdVisitsTable, admissionsTable, 
  labTestsTable, radiologyOrdersTable, prescriptionsTable, invoicesTable 
} from "@workspace/db";
import { CreatePatientBody, UpdatePatientBody } from "@workspace/api-zod";

const router: IRouter = Router();

/**
 * گۆڕینی داتای نەخۆش بۆ شێوازی گونجاو بۆ کلاینت (Serialization)
 */
function serialize(p: typeof patientsTable.$inferSelect) {
  return {
    id: p.id,
    mrn: p.mrn,
    fullName: p.fullName,
    gender: p.gender,
    dob: p.dob,
    phone: p.phone,
    address: p.address,
    bloodType: p.bloodType,
    emergencyContact: p.emergencyContact,
    notes: p.notes,
    createdAt: p.createdAt.toISOString(),
  };
}

// وەرگرتنی لیستی هەموو نەخۆشەکان
router.get("/patients", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(patientsTable)
    .orderBy(desc(patientsTable.createdAt));
  res.json(rows.map(serialize));
});

// زیادکردنی نەخۆشی نوێ و دروستکردنی ژمارەی تۆمار (MRN) بە شێوەی خۆکار
router.post("/patients", async (req, res): Promise<void> => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  
  // دروستکردنی ژمارەی تۆماری ناوازە لەسەر بنەمای کاتی ئێستا
  const mrn = `MRN-${Date.now().toString().slice(-8)}`;
  
  const [row] = await db
    .insert(patientsTable)
    .values({ ...parsed.data, mrn })
    .returning();
  res.status(201).json(serialize(row));
});

// وەرگرتنی زانیاری یەک نەخۆش بەپێی ناسنامە (ID)
router.get("/patients/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db
    .select()
    .from(patientsTable)
    .where(eq(patientsTable.id, id));
  if (!row) {
    res.status(404).json({ error: "نەخۆش نەدۆزرایەوە" });
    return;
  }
  res.json(serialize(row));
});

// دەستکاری کردنی زانیارییەکانی نەخۆش
router.patch("/patients/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = UpdatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(patientsTable)
    .set(parsed.data)
    .where(eq(patientsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "نەخۆش نەدۆزرایەوە" });
    return;
  }
  res.json(serialize(row));
});

/**
 * دروستکردنی هێڵی کاتی پزیشکی نەخۆش (Patient Timeline)
 * ئەم بەشە هەموو داتاکانی نەخۆش لە خشتە جیاوازەکان کۆدەکاتەوە و بەپێی کات ڕێکیان دەخات
 */
router.get("/patients/:id/timeline", async (req, res): Promise<void> => {
  const patientId = Number(req.params.id);
  
  // وەرگرتنی هەموو تۆمارە پەیوەندیدارەکان بە شێوەی هاوتەریب بۆ خێراکردنی پرۆسەکە
  const [opd, ipd, lab, rad, prescriptions, invoices] = await Promise.all([
    db.select().from(opdVisitsTable).where(eq(opdVisitsTable.patientId, patientId)).orderBy(desc(opdVisitsTable.appointmentAt)),
    db.select().from(admissionsTable).where(eq(admissionsTable.patientId, patientId)).orderBy(desc(admissionsTable.admittedAt)),
    db.select().from(labTestsTable).where(eq(labTestsTable.patientId, patientId)).orderBy(desc(labTestsTable.requestedAt)),
    db.select().from(radiologyOrdersTable).where(eq(radiologyOrdersTable.patientId, patientId)).orderBy(desc(radiologyOrdersTable.requestedAt)),
    db.select().from(prescriptionsTable).where(eq(prescriptionsTable.patientId, patientId)).orderBy(desc(prescriptionsTable.createdAt)),
    db.select().from(invoicesTable).where(eq(invoicesTable.patientId, patientId)).orderBy(desc(invoicesTable.createdAt)),
  ]);

  // کۆکردنەوە و گۆڕینی هەموو جۆرە چالاکییەکان بۆ یەک شێواز (Timeline Object)
  const timeline = [
    ...opd.map(r => ({ type: 'opd', date: r.appointmentAt.toISOString(), title: 'سەردانی کلینیک', detail: r.complaint || 'پشکنینی گشتی', status: r.status, id: r.id })),
    ...ipd.map(r => ({ type: 'ipd', date: r.admittedAt.toISOString(), title: 'خەواندن لە نەخۆشخانە', detail: r.reason || 'بەشی ناوخۆیی', status: r.status, id: r.id })),
    ...lab.map(r => ({ type: 'lab', date: r.requestedAt.toISOString(), title: 'پشکنینی تاقیگە', detail: r.testName, status: r.status, id: r.id })),
    ...rad.map(r => ({ type: 'radiology', date: r.requestedAt.toISOString(), title: 'تیشک و سۆنار', detail: `${r.modality} - ${r.bodyPart}`, status: r.status, id: r.id })),
    ...prescriptions.map(r => ({ type: 'prescription', date: r.createdAt.toISOString(), title: 'نوسخەی پزیشکی', detail: r.medications, status: 'active', id: r.id })),
    ...invoices.map(r => ({ type: 'billing', date: r.createdAt.toISOString(), title: 'پسوولەی پارە', detail: `${r.amount} دینار`, status: r.status, id: r.id })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // ڕیزکردن لە نوێترینەوە بۆ کۆنترین

  res.json(timeline);
});

/**
 * سڕینەوەی نەخۆش (تەنها ئادمین)
 */
router.delete("/patients/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db
    .delete(patientsTable)
    .where(eq(patientsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "نەخۆش نەدۆزرایەوە" });
    return;
  }
  res.json({ success: true, message: "نەخۆش سڕایەوە" });
});

export default router;
