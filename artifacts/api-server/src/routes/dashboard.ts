import { Router, type IRouter } from "express";
import { and, gte, lt, eq, lte, sql, desc } from "drizzle-orm";
import {
  db,
  patientsTable,
  staffTable,
  opdVisitsTable,
  admissionsTable,
  emergencyVisitsTable,
  surgeriesTable,
  labTestsTable,
  radiologyOrdersTable,
  medicationsTable,
  invoicesTable,
  bedsTable,
  pharmacySalesTable,
} from "@workspace/db";

const router: IRouter = Router();

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const in30 = addDays(today, 30);

  const [
    [{ totalPatients }],
    [{ todayOpdVisits }],
    [{ admittedPatients }],
    [{ emergencyToday }],
    [{ scheduledSurgeriesToday }],
    [{ pendingLabTests }],
    [{ pendingRadiology }],
    [{ todayRevenue }],
    [{ monthRevenue }],
    [{ unpaidInvoices }],
    [{ lowStockMedications }],
    [{ expiringMedications }],
    [{ totalStaff }],
    bedsAll,
  ] = await Promise.all([
    db.select({ totalPatients: sql<number>`count(*)::int` }).from(patientsTable),
    db
      .select({ todayOpdVisits: sql<number>`count(*)::int` })
      .from(opdVisitsTable)
      .where(
        and(
          gte(opdVisitsTable.appointmentAt, today),
          lt(opdVisitsTable.appointmentAt, tomorrow),
        ),
      ),
    db
      .select({ admittedPatients: sql<number>`count(*)::int` })
      .from(admissionsTable)
      .where(eq(admissionsTable.status, "active")),
    db
      .select({ emergencyToday: sql<number>`count(*)::int` })
      .from(emergencyVisitsTable)
      .where(
        and(
          gte(emergencyVisitsTable.arrivalAt, today),
          lt(emergencyVisitsTable.arrivalAt, tomorrow),
        ),
      ),
    db
      .select({ scheduledSurgeriesToday: sql<number>`count(*)::int` })
      .from(surgeriesTable)
      .where(
        and(
          gte(surgeriesTable.scheduledAt, today),
          lt(surgeriesTable.scheduledAt, tomorrow),
        ),
      ),
    db
      .select({ pendingLabTests: sql<number>`count(*)::int` })
      .from(labTestsTable)
      .where(eq(labTestsTable.status, "pending")),
    db
      .select({ pendingRadiology: sql<number>`count(*)::int` })
      .from(radiologyOrdersTable)
      .where(eq(radiologyOrdersTable.status, "pending")),
    db
      .select({
        todayRevenue: sql<number>`coalesce(sum(${invoicesTable.paidAmount}),0)::float`,
      })
      .from(invoicesTable)
      .where(
        and(
          gte(invoicesTable.createdAt, today),
          lt(invoicesTable.createdAt, tomorrow),
        ),
      ),
    db
      .select({
        monthRevenue: sql<number>`coalesce(sum(${invoicesTable.paidAmount}),0)::float`,
      })
      .from(invoicesTable)
      .where(gte(invoicesTable.createdAt, monthStart)),
    db
      .select({ unpaidInvoices: sql<number>`count(*)::int` })
      .from(invoicesTable)
      .where(eq(invoicesTable.status, "unpaid")),
    db
      .select({ lowStockMedications: sql<number>`count(*)::int` })
      .from(medicationsTable)
      .where(sql`${medicationsTable.stock} <= ${medicationsTable.reorderLevel}`),
    db
      .select({ expiringMedications: sql<number>`count(*)::int` })
      .from(medicationsTable)
      .where(
        and(
          sql`${medicationsTable.expiresOn} is not null`,
          lte(medicationsTable.expiresOn, in30.toISOString().slice(0, 10)),
        ),
      ),
    db.select({ totalStaff: sql<number>`count(*)::int` }).from(staffTable),
    db.select().from(bedsTable),
  ]);

  const occupiedBeds = bedsAll.filter((b) => b.occupied).length;
  const availableBeds = bedsAll.length - occupiedBeds;

  res.json({
    totalPatients,
    todayOpdVisits,
    admittedPatients,
    emergencyToday,
    scheduledSurgeriesToday,
    pendingLabTests,
    pendingRadiology,
    todayRevenue,
    monthRevenue,
    unpaidInvoices,
    lowStockMedications,
    expiringMedications,
    totalStaff,
    availableBeds,
    occupiedBeds,
  });
});

router.get("/dashboard/visits-trend", async (_req, res): Promise<void> => {
  const today = startOfDay(new Date());
  const start = addDays(today, -13);
  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${opdVisitsTable.appointmentAt}), 'YYYY-MM-DD')`,
      value: sql<number>`count(*)::int`,
    })
    .from(opdVisitsTable)
    .where(gte(opdVisitsTable.appointmentAt, start))
    .groupBy(sql`date_trunc('day', ${opdVisitsTable.appointmentAt})`)
    .orderBy(sql`date_trunc('day', ${opdVisitsTable.appointmentAt})`);
  const map = new Map(rows.map((r) => [r.date, Number(r.value)]));
  const out: { date: string; value: number; label: string | null }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = addDays(start, i).toISOString().slice(0, 10);
    out.push({ date: d, value: map.get(d) ?? 0, label: null });
  }
  res.json(out);
});

router.get("/dashboard/revenue-trend", async (_req, res): Promise<void> => {
  const today = startOfDay(new Date());
  const start = addDays(today, -13);
  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${invoicesTable.createdAt}), 'YYYY-MM-DD')`,
      value: sql<number>`coalesce(sum(${invoicesTable.paidAmount}),0)::float`,
    })
    .from(invoicesTable)
    .where(gte(invoicesTable.createdAt, start))
    .groupBy(sql`date_trunc('day', ${invoicesTable.createdAt})`)
    .orderBy(sql`date_trunc('day', ${invoicesTable.createdAt})`);
  const map = new Map(rows.map((r) => [r.date, Number(r.value)]));
  const out: { date: string; value: number; label: string | null }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = addDays(start, i).toISOString().slice(0, 10);
    out.push({ date: d, value: map.get(d) ?? 0, label: null });
  }
  res.json(out);
});

router.get("/dashboard/department-load", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      department: sql<string>`coalesce(${staffTable.department}, 'گشتی')`,
      count: sql<number>`count(*)::int`,
    })
    .from(opdVisitsTable)
    .leftJoin(staffTable, eq(staffTable.id, opdVisitsTable.doctorId))
    .groupBy(staffTable.department)
    .orderBy(desc(sql`count(*)`));
  res.json(rows);
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const items: {
    id: string;
    kind: string;
    title: string;
    subtitle: string | null;
    at: string;
  }[] = [];

  const opd = await db
    .select()
    .from(opdVisitsTable)
    .orderBy(desc(opdVisitsTable.createdAt))
    .limit(5);
  for (const v of opd) {
    items.push({
      id: `opd-${v.id}`,
      kind: "opd",
      title: `سەردانی کلینیک #${v.id}`,
      subtitle: v.complaint,
      at: v.createdAt.toISOString(),
    });
  }

  const er = await db
    .select()
    .from(emergencyVisitsTable)
    .orderBy(desc(emergencyVisitsTable.arrivalAt))
    .limit(5);
  for (const e of er) {
    items.push({
      id: `er-${e.id}`,
      kind: "emergency",
      title: `فریاگوزاری: ${e.patientName}`,
      subtitle: e.complaint,
      at: e.arrivalAt.toISOString(),
    });
  }

  const surg = await db
    .select()
    .from(surgeriesTable)
    .orderBy(desc(surgeriesTable.scheduledAt))
    .limit(5);
  for (const s of surg) {
    items.push({
      id: `surg-${s.id}`,
      kind: "surgery",
      title: `نەشتەرگەری: ${s.procedureName}`,
      subtitle: s.operatingRoom,
      at: s.scheduledAt.toISOString(),
    });
  }

  const sales = await db
    .select()
    .from(pharmacySalesTable)
    .orderBy(desc(pharmacySalesTable.soldAt))
    .limit(5);
  for (const s of sales) {
    items.push({
      id: `sale-${s.id}`,
      kind: "pharmacy",
      title: `فرۆشتنی دەرمان بۆ ${s.patientName}`,
      subtitle: `${s.quantity} دانە`,
      at: s.soldAt.toISOString(),
    });
  }

  const inv = await db
    .select()
    .from(invoicesTable)
    .orderBy(desc(invoicesTable.createdAt))
    .limit(5);
  for (const i of inv) {
    items.push({
      id: `inv-${i.id}`,
      kind: "invoice",
      title: `پسوولەی #${i.id}`,
      subtitle: i.items,
      at: i.createdAt.toISOString(),
    });
  }

  items.sort((a, b) => (a.at > b.at ? -1 : 1));
  res.json(items.slice(0, 15));
});

export default router;
