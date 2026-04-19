import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import {
  db,
  shiftsTable,
  leavesTable,
  payrollTable,
} from "@workspace/db";
import {
  CreateShiftBody,
  CreateLeaveBody,
  CreatePayrollBody,
} from "@workspace/api-zod";
import { getStaffNameMap } from "../lib/lookups";

const router: IRouter = Router();

// وەرگرتنی خشتەی دەوامی کارمەندان
router.get("/shifts", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(shiftsTable)
    .orderBy(desc(shiftsTable.shiftDate));
  const staffMap = await getStaffNameMap(rows.map((r) => r.staffId));
  res.json(
    rows.map((r) => ({
      ...r,
      staffName: staffMap.get(r.staffId) ?? "—",
    })),
  );
});

// دیاریکردنی دەوام (Shift) بۆ کارمەندێک
router.post("/shifts", async (req, res): Promise<void> => {
  const parsed = CreateShiftBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(shiftsTable).values(parsed.data).returning();
  const staffMap = await getStaffNameMap([row.staffId]);
  res.status(201).json({ ...row, staffName: staffMap.get(row.staffId) ?? "—" });
});

// وەرگرتنی لیستی مۆڵەتی کارمەندان
router.get("/leaves", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(leavesTable)
    .orderBy(desc(leavesTable.fromDate));
  const staffMap = await getStaffNameMap(rows.map((r) => r.staffId));
  res.json(
    rows.map((r) => ({
      ...r,
      staffName: staffMap.get(r.staffId) ?? "—",
    })),
  );
});

// داواکردنی مۆڵەت لەلایەن کارمەندەوە
router.post("/leaves", async (req, res): Promise<void> => {
  const parsed = CreateLeaveBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(leavesTable).values(parsed.data).returning();
  const staffMap = await getStaffNameMap([row.staffId]);
  res.status(201).json({ ...row, staffName: staffMap.get(row.staffId) ?? "—" });
});

// وەرگرتنی لیستی مووچەپێدراوەکان (Payroll History)
router.get("/payroll", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(payrollTable)
    .orderBy(desc(payrollTable.month));
  const staffMap = await getStaffNameMap(rows.map((r) => r.staffId));
  res.json(
    rows.map((r) => ({
      ...r,
      staffName: staffMap.get(r.staffId) ?? "—",
      paidAt: r.paidAt ? r.paidAt.toISOString() : null,
    })),
  );
});

/**
 * ئەنجامدانی موچەی مانگانە بۆ کارمەند
 * لەم بەشەدا کۆی گشتی موچە (Net Salary) بە شێوەی خۆکار هەژمار دەکرێت
 */
router.post("/payroll", async (req, res): Promise<void> => {
  const parsed = CreatePayrollBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  
  // لۆژیکی هەژمارکردنی موچە: (موچەی بنەڕەتی + پاداشت) - لێبڕینەکان
  const net =
    parsed.data.baseSalary + parsed.data.bonus - parsed.data.deductions;
    
  const [row] = await db
    .insert(payrollTable)
    .values({ ...parsed.data, net, paidAt: new Date() })
    .returning();
    
  const staffMap = await getStaffNameMap([row.staffId]);
  res.status(201).json({
    ...row,
    staffName: staffMap.get(row.staffId) ?? "—",
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
  });
});

export default router;
