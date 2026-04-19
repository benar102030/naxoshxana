import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, inventoryItemsTable, inventoryTransactionsTable } from "@workspace/db";
import {
  CreateInventoryItemBody,
  UpdateInventoryItemBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// وەرگرتنی لیستی گشتی هەموو کەلوپەلەکانی ناو کۆگا
router.get("/inventory-items", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(inventoryItemsTable)
    .orderBy(inventoryItemsTable.name);
  res.json(rows);
});

/**
 * زیادکردنی کەلوپەلی نوێ بۆ کۆگا
 * لێرەدا پاش زیادکردن، تۆمارێکی مێژوویی (Transaction) دروست دەکەین بۆ بڕی سەرەتایی
 */
router.post("/inventory-items", async (req, res): Promise<void> => {
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(inventoryItemsTable)
    .values(parsed.data)
    .returning();
  
  // دۆکیومێنتکردنی جۆری گۆڕانکاری لە کۆگا
  await db.insert(inventoryTransactionsTable).values({
    itemId: row.id,
    change: row.quantity,
    type: 'in', // نیشانەی هاتنەژوورەوەی کەلوپەل
    reason: 'تۆمارکردنی سەرەتایی',
  });

  res.status(201).json(row);
});

// وەرگرتنی مێژووی گۆڕانکارییەکانی کۆگا (هاتن و چوون)
router.get("/inventory-transactions", async (req, res): Promise<void> => {
  const itemId = req.query.itemId ? Number(req.query.itemId) : undefined;
  let query = db.select().from(inventoryTransactionsTable);
  
  if (itemId) {
    // ئەگەر تەنها بۆ یەک پارچە گەڕاین
    // @ts-ignore
    query = query.where(eq(inventoryTransactionsTable.itemId, itemId));
  }
  
  const rows = await query.orderBy(desc(inventoryTransactionsTable.createdAt));
  res.json(rows);
});

/**
 * گۆڕینی زانیارییەکانی کەلوپەل یان نوێکردنەوەی بڕ
 * کاتێک بڕی کەلوپەلێک دەگۆڕدرێت، خۆکارانە تۆمارێکی گۆڕانکاری بۆ دروست دەبێت
 */
router.patch("/inventory-items/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(inventoryItemsTable)
    .set(parsed.data)
    .where(eq(inventoryItemsTable.id, id))
    .returning();
    
  if (!row) {
    res.status(404).json({ error: "بابەت نەدۆزرایەوە" });
    return;
  }

  // ئەگەر بڕی کەلوپەلەکە دەستکاری کرا، تۆمارێکی بۆ بکە لە خشتەی مێژوودا
  if (parsed.data.quantity !== undefined) {
    await db.insert(inventoryTransactionsTable).values({
      itemId: row.id,
      change: parsed.data.quantity,
      type: 'adjustment', // نیشانەی دەستکاری ڕاستەوخۆ
      reason: 'نوێکردنەوەی بڕ',
    });
  }

  res.json(row);
});

export default router;
