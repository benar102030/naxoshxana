import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, surgeriesTable } from "@workspace/db";
import { CreateSurgeryBody, UpdateSurgeryBody } from "@workspace/api-zod";
import { getPatientNameMap, getStaffNameMap } from "../lib/lookups";

const router: IRouter = Router();

/**
 * زیادکردنی ناوی نەخۆش و پزیشکی نەشتەرگەر بۆ لیستی نەشتەرگەرییەکان
 */
async function expand(rows: (typeof surgeriesTable.$inferSelect)[]) {
  const patientMap = await getPatientNameMap(rows.map((r) => r.patientId));
  const staffMap = await getStaffNameMap(rows.map((r) => r.surgeonId));
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: patientMap.get(r.patientId) ?? "—",
    surgeonId: r.surgeonId,
    surgeonName: staffMap.get(r.surgeonId) ?? "—",
    operatingRoom: r.operatingRoom, // ژووری نەشتەرگەری
    scheduledAt: r.scheduledAt.toISOString(), // کاتی دیاریکراو
    procedureName: r.procedureName, // جۆری نەشتەرگەری
    anesthesia: r.anesthesia, // جۆری بەنج
    status: r.status,
    notes: r.notes,
  }));
}

// وەرگرتنی لیستی گشتی خشتەی نەشتەرگەرییەکان
router.get("/surgeries", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(surgeriesTable)
    .orderBy(desc(surgeriesTable.scheduledAt));
  res.json(await expand(rows));
});

// تۆمارکردنی کات و جۆری نەشتەرگەرییەکی نوێ
router.post("/surgeries", async (req, res): Promise<void> => {
  const parsed = CreateSurgeryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(surgeriesTable)
    .values({
      ...parsed.data,
      scheduledAt: new Date(parsed.data.scheduledAt),
      status: "scheduled", // دۆخەکەی بە 'دیاریکراو' دادەنرێت
    })
    .returning();
  res.status(201).json((await expand([row]))[0]);
});

// ئەپدێتکردنی زانیاری یان دۆخی نەشتەرگەری (وەک: 'تەواو بوو' یان 'هەڵوەشایەوە')
router.patch("/surgeries/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = UpdateSurgeryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(surgeriesTable)
    .set(parsed.data)
    .where(eq(surgeriesTable.id, id))
    .returning();
    
  if (!row) {
    res.status(404).json({ error: "نەشتەرگەری نەدۆزرایەوە" });
    return;
  }
  res.json((await expand([row]))[0]);
});

export default router;
