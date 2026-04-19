import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, invoicesTable } from "@workspace/db";
import { CreateInvoiceBody, PayInvoiceBody } from "@workspace/api-zod";
import { getPatientNameMap } from "../lib/lookups";

const router: IRouter = Router();

async function expand(rows: (typeof invoicesTable.$inferSelect)[]) {
  const patientMap = await getPatientNameMap(rows.map((r) => r.patientId));
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: patientMap.get(r.patientId) ?? "—",
    items: r.items,
    amount: r.amount,
    paidAmount: r.paidAmount,
    status: r.status,
    paymentMethod: r.paymentMethod,
    createdAt: r.createdAt.toISOString(),
  }));
}

router.get("/invoices", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(invoicesTable)
    .orderBy(desc(invoicesTable.createdAt));
  res.json(await expand(rows));
});

router.post("/invoices", async (req, res): Promise<void> => {
  const parsed = CreateInvoiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(invoicesTable)
    .values({ ...parsed.data, status: "unpaid", paidAmount: 0 })
    .returning();
  res.status(201).json((await expand([row]))[0]);
});

router.post("/invoices/:id/payments", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = PayInvoiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [inv] = await db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.id, id));
  if (!inv) {
    res.status(404).json({ error: "پسوولە نەدۆزرایەوە" });
    return;
  }
  const newPaid = inv.paidAmount + parsed.data.amount;
  const status =
    newPaid >= inv.amount ? "paid" : newPaid > 0 ? "partial" : "unpaid";
  const [row] = await db
    .update(invoicesTable)
    .set({
      paidAmount: newPaid,
      status,
      paymentMethod: parsed.data.method,
    })
    .where(eq(invoicesTable.id, id))
    .returning();
  res.json((await expand([row]))[0]);
});

export default router;
