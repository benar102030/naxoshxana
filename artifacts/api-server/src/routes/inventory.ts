import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, inventoryItemsTable } from "@workspace/db";
import {
  CreateInventoryItemBody,
  UpdateInventoryItemBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/inventory-items", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(inventoryItemsTable)
    .orderBy(inventoryItemsTable.name);
  res.json(rows);
});

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
  res.status(201).json(row);
});

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
  res.json(row);
});

export default router;
