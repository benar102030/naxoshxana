import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, radiologyOrdersTable } from "@workspace/db";
import {
  CreateRadiologyOrderBody,
  UpdateRadiologyOrderBody,
} from "@workspace/api-zod";
import { getPatientNameMap, getStaffNameMap } from "../lib/lookups";

const router: IRouter = Router();

async function expand(rows: (typeof radiologyOrdersTable.$inferSelect)[]) {
  const patientMap = await getPatientNameMap(rows.map((r) => r.patientId));
  const staffMap = await getStaffNameMap(rows.map((r) => r.doctorId));
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: patientMap.get(r.patientId) ?? "—",
    doctorId: r.doctorId,
    doctorName: staffMap.get(r.doctorId) ?? "—",
    modality: r.modality,
    bodyPart: r.bodyPart,
    requestedAt: r.requestedAt.toISOString(),
    status: r.status,
    report: r.report,
    imageUrl: r.imageUrl,
    price: r.price,
  }));
}

router.get("/radiology-orders", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(radiologyOrdersTable)
    .orderBy(desc(radiologyOrdersTable.requestedAt));
  res.json(await expand(rows));
});

router.post("/radiology-orders", async (req, res): Promise<void> => {
  const parsed = CreateRadiologyOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(radiologyOrdersTable)
    .values({ ...parsed.data, status: "pending" })
    .returning();
  res.status(201).json((await expand([row]))[0]);
});

router.patch("/radiology-orders/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = UpdateRadiologyOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(radiologyOrdersTable)
    .set(parsed.data)
    .where(eq(radiologyOrdersTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "داواکاری نەدۆزرایەوە" });
    return;
  }
  res.json((await expand([row]))[0]);
});

export default router;
