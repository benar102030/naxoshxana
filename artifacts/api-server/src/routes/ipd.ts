import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, admissionsTable, bedsTable } from "@workspace/db";
import {
  CreateAdmissionBody,
  UpdateAdmissionBody,
} from "@workspace/api-zod";
import {
  getPatientNameMap,
  getStaffNameMap,
  getBedLabelMap,
} from "../lib/lookups";

const router: IRouter = Router();

async function expand(rows: (typeof admissionsTable.$inferSelect)[]) {
  const patientMap = await getPatientNameMap(rows.map((r) => r.patientId));
  const staffMap = await getStaffNameMap(rows.map((r) => r.doctorId));
  const bedMap = await getBedLabelMap(rows.map((r) => r.bedId));
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: patientMap.get(r.patientId) ?? "—",
    bedId: r.bedId,
    bedLabel: bedMap.get(r.bedId) ?? "—",
    doctorId: r.doctorId,
    doctorName: staffMap.get(r.doctorId) ?? "—",
    admittedAt: r.admittedAt.toISOString(),
    dischargedAt: r.dischargedAt ? r.dischargedAt.toISOString() : null,
    reason: r.reason,
    status: r.status,
    dailyRate: r.dailyRate,
  }));
}

router.get("/admissions", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(admissionsTable)
    .orderBy(desc(admissionsTable.admittedAt));
  res.json(await expand(rows));
});

router.post("/admissions", async (req, res): Promise<void> => {
  const parsed = CreateAdmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(admissionsTable)
    .values({ ...parsed.data, status: "active" })
    .returning();
  await db
    .update(bedsTable)
    .set({ occupied: true })
    .where(eq(bedsTable.id, parsed.data.bedId));
  res.status(201).json((await expand([row]))[0]);
});

router.patch("/admissions/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = UpdateAdmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "discharged" && !parsed.data.dischargedAt) {
    updates["dischargedAt"] = new Date();
  } else if (parsed.data.dischargedAt) {
    updates["dischargedAt"] = new Date(parsed.data.dischargedAt);
  }
  const [row] = await db
    .update(admissionsTable)
    .set(updates)
    .where(eq(admissionsTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "نوسـتنەوە نەدۆزرایەوە" });
    return;
  }
  if (row.status === "discharged") {
    await db
      .update(bedsTable)
      .set({ occupied: false })
      .where(eq(bedsTable.id, row.bedId));
  }
  res.json((await expand([row]))[0]);
});

router.get("/beds", async (_req, res): Promise<void> => {
  const rows = await db.select().from(bedsTable).orderBy(bedsTable.id);
  res.json(rows);
});

export default router;
