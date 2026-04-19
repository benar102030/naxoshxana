import { Router } from "express";
import { db, bloodInventoryTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

// وەرگرتنی لیستی جۆرەکانی خوێن و بڕەکانیان
router.get("/blood-bank", async (req, res) => {
  try {
    const inventory = await db.select().from(bloodInventoryTable);
    
    // ئەگەر خشتەکە بەتاڵ بوو، ئەو جۆرانە بە بەتاڵی دابنێ بۆ پێشاندانی وێنەیی
    if (inventory.length === 0) {
      const defaultBloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
      const defaultInventory = defaultBloodGroups.map(bg => ({
        id: 0,
        bloodGroup: bg,
        units: 0,
        lastUpdated: new Date()
      }));
      return res.json(defaultInventory);
    }
    
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: "نەتوانرا زانیارییەکانی بانکی خوێن بهێنرێت" });
  }
});

// نوێکردنەوە یان زیادکردنی جۆرێکی خوێن
router.post("/blood-bank", async (req, res) => {
  const { bloodGroup, units } = req.body;

  if (!bloodGroup || units === undefined) {
    return res.status(400).json({ error: "تکایە زانیاری تەواو داخڵ بکە" });
  }

  try {
    // ئەگەر جۆری خوێنەکە هەبوو ئەوا بڕەکەی نوێ بکەرەوە، ئەگەرنا دروستی بکە
    const existing = await db.select().from(bloodInventoryTable).where(eq(bloodInventoryTable.bloodGroup, bloodGroup)).limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(bloodInventoryTable)
        .set({ units: existing[0].units + Number(units), lastUpdated: new Date() })
        .where(eq(bloodInventoryTable.bloodGroup, bloodGroup))
        .returning();
      return res.json(updated[0]);
    } else {
      const inserted = await db
        .insert(bloodInventoryTable)
        .values({ bloodGroup, units: Math.max(0, Number(units)) })
        .returning();
      return res.json(inserted[0]);
    }
  } catch (error) {
    res.status(500).json({ error: "هەڵەیەک ڕوویدا لە کاتی نوێکردنەوەی بڕی خوێن" });
  }
});

export default router;
