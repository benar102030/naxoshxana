import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, medicationsTable, pharmacySalesTable } from "@workspace/db";
import {
  CreateMedicationBody,
  UpdateMedicationBody,
  CreatePharmacySaleBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// وەرگرتنی لیستی دەرمانە بەردەستەکانی دەرمانخانە
router.get("/medications", async (_req, res): Promise<void> => {
  const rows = await db.select().from(medicationsTable).orderBy(medicationsTable.name);
  res.json(rows);
});

// زیادکردنی دەرمانی نوێ بۆ لیستی دەرمانخانە
router.post("/medications", async (req, res): Promise<void> => {
  const parsed = CreateMedicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(medicationsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

// ئەپدێتکردنی نرخ یان زانیارییەکانی دەرمانی پاشەکەوتکراو
router.patch("/medications/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = UpdateMedicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(medicationsTable)
    .set(parsed.data)
    .where(eq(medicationsTable.id, id))
    .returning();
    
  if (!row) {
    res.status(404).json({ error: "دەرمان نەدۆزرایەوە" });
    return;
  }
  res.json(row);
});

// وەرگرتنی مێژووی فرۆشتنی دەرمانەکان بۆ نەخۆش
router.get("/pharmacy-sales", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: pharmacySalesTable.id,
      patientName: pharmacySalesTable.patientName,
      patientId: pharmacySalesTable.patientId,
      medicationId: pharmacySalesTable.medicationId,
      medicationName: medicationsTable.name,
      quantity: pharmacySalesTable.quantity,
      unitPrice: pharmacySalesTable.unitPrice,
      total: pharmacySalesTable.total,
      soldAt: pharmacySalesTable.soldAt,
    })
    .from(pharmacySalesTable)
    .leftJoin(
      medicationsTable,
      eq(medicationsTable.id, pharmacySalesTable.medicationId),
    )
    .orderBy(desc(pharmacySalesTable.soldAt));
    
  res.json(
    rows.map((r) => ({
      ...r,
      medicationName: r.medicationName ?? "—",
      soldAt: r.soldAt.toISOString(),
    })),
  );
});

/**
 * ئەنجامدانی پرۆسەی فرۆشتنی دەرمان
 * لەم بەشەدا دوای فرۆشتنەکە، بڕی دەرمان لە کۆگا (Stock) بە شێوەی خۆکار کەمدەکرێتەوە
 */
router.post("/pharmacy-sales", async (req, res): Promise<void> => {
  const parsed = CreatePharmacySaleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  
  // دڵنیابوونەوە لە هەبوونی دەرمانەکە لە کۆگا
  const [med] = await db
    .select()
    .from(medicationsTable)
    .where(eq(medicationsTable.id, parsed.data.medicationId));
    
  if (!med) {
    res.status(404).json({ error: "دەرمان نەدۆزرایەوە" });
    return;
  }
  
  // هەژمارکردنی کۆی گشتی پارەی فرۆشتنەکە
  const total = med.price * parsed.data.quantity;
  
  const [row] = await db
    .insert(pharmacySalesTable)
    .values({
      ...parsed.data,
      unitPrice: med.price,
      total,
    })
    .returning();
    
  // گرنگ: کەمکردنەوەی بڕی دەرمانی فرۆشراو لە کۆگای سەرەکی (Auto Stock Sync)
  await db
    .update(medicationsTable)
    .set({ stock: sql`${medicationsTable.stock} - ${parsed.data.quantity}` })
    .where(eq(medicationsTable.id, parsed.data.medicationId));
    
  res.json({
    ...row,
    medicationName: med.name,
    soldAt: row.soldAt.toISOString(),
  });
});

export default router;
