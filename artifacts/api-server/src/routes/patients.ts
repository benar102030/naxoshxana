import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, patientsTable } from "@workspace/db";
import { CreatePatientBody, UpdatePatientBody } from "@workspace/api-zod";

const router: IRouter = Router();

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

router.get("/patients", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(patientsTable)
    .orderBy(desc(patientsTable.createdAt));
  res.json(rows.map(serialize));
});

router.post("/patients", async (req, res): Promise<void> => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const mrn = `MRN-${Date.now().toString().slice(-8)}`;
  const [row] = await db
    .insert(patientsTable)
    .values({ ...parsed.data, mrn })
    .returning();
  res.status(201).json(serialize(row));
});

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

export default router;
