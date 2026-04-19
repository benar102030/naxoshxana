import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, labTestsTable } from "@workspace/db";
import { CreateLabTestBody, UpdateLabTestBody } from "@workspace/api-zod";
import { getPatientNameMap, getStaffNameMap } from "../lib/lookups";

const router: IRouter = Router();

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

router.get("/lab-tests", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(labTestsTable)
    .orderBy(desc(labTestsTable.requestedAt));
  res.json(await expand(rows));
});

router.post("/lab-tests", async (req, res): Promise<void> => {
  const parsed = CreateLabTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(labTestsTable)
    .values({ ...parsed.data, status: "pending" })
    .returning();
  res.status(201).json((await expand([row]))[0]);
});

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
  res.json((await expand([row]))[0]);
});

export default router;
