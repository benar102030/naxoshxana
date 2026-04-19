import {
  db,
  staffTable,
  patientsTable,
  bedsTable,
  opdVisitsTable,
  admissionsTable,
  emergencyVisitsTable,
  surgeriesTable,
  labTestsTable,
  radiologyOrdersTable,
  medicationsTable,
  pharmacySalesTable,
  prescriptionsTable,
  shiftsTable,
  leavesTable,
  payrollTable,
  invoicesTable,
  inventoryItemsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  // wipe
  for (const t of [
    pharmacySalesTable,
    prescriptionsTable,
    labTestsTable,
    radiologyOrdersTable,
    surgeriesTable,
    emergencyVisitsTable,
    admissionsTable,
    opdVisitsTable,
    invoicesTable,
    payrollTable,
    leavesTable,
    shiftsTable,
    medicationsTable,
    inventoryItemsTable,
    bedsTable,
    patientsTable,
    staffTable,
  ]) {
    await db.delete(t);
  }

  await db.execute(sql`ALTER SEQUENCE staff_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE patients_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE beds_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE medications_id_seq RESTART WITH 1`);

  // STAFF (one per role) — every demo password is "demo"
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);
  const demoPw = hash("demo");
  const staff = await db
    .insert(staffTable)
    .values([
      { fullName: "د. ئاراس کەمال", username: "admin", password: demoPw, role: "admin", department: "بەڕێوەبردن", phone: "0750-1000001", salary: 2500 },
      { fullName: "د. شیلان حەسەن", username: "doctor1", password: demoPw, role: "doctor", department: "ناوخۆیی", phone: "0750-1000002", salary: 2200 },
      { fullName: "د. کاوە محەمەد", username: "doctor2", password: demoPw, role: "doctor", department: "منداڵان", phone: "0750-1000003", salary: 2200 },
      { fullName: "د. ژیان ئەحمەد", username: "doctor3", password: demoPw, role: "doctor", department: "نەشتەرگەری", phone: "0750-1000004", salary: 2400 },
      { fullName: "د. ڕێبین ئیبراهیم", username: "doctor4", password: demoPw, role: "doctor", department: "فریاگوزاری", phone: "0750-1000005", salary: 2300 },
      { fullName: "نازەنین ئومێد", username: "nurse1", password: demoPw, role: "nurse", department: "نوستن", phone: "0750-2000001", salary: 1100 },
      { fullName: "ھێرۆ ساڵح", username: "nurse2", password: demoPw, role: "nurse", department: "فریاگوزاری", phone: "0750-2000002", salary: 1100 },
      { fullName: "زانا یوسف", username: "pharmacist", password: demoPw, role: "pharmacist", department: "دەرمانخانە", phone: "0750-3000001", salary: 1500 },
      { fullName: "ئاوات نوری", username: "cashier", password: demoPw, role: "cashier", department: "پسوولەکان", phone: "0750-4000001", salary: 1000 },
      { fullName: "ھیوا فەرھاد", username: "labtech", password: demoPw, role: "labtech", department: "تاقیگە", phone: "0750-5000001", salary: 1200 },
      { fullName: "بەرزان عەلی", username: "radtech", password: demoPw, role: "radtech", department: "تیشک", phone: "0750-6000001", salary: 1300 },
      { fullName: "تارا ڕەسوڵ", username: "manager", password: demoPw, role: "manager", department: "بەڕێوەبردن", phone: "0750-7000001", salary: 2000 },
    ])
    .returning();

  // PATIENTS
  const patientNames = [
    "ئاسۆ محەمەد", "بێریڤان جەلال", "هاوژین ئاکۆ", "سەنگەر کاکە", "ڤیان عەزیز",
    "هۆگر فەرید", "ڕۆژان نەوزاد", "نیاز شێرکۆ", "هێمن خالید", "ژیار سۆران",
    "بانوو شکر", "دڵشاد رەفیق", "ئەسرین مەجید", "زانیار قادر", "میدیا دڵزار",
    "ڕەزا ئیمان", "ئەستێرە لاوین", "گۆران تەها", "نیشتمان وریا", "ھاوژین ئامانج",
    "شیلان مظهر", "بەستوون رۆبار", "تریفە دانا", "بەرواری سەردار", "هەرشا گوڵڵە",
    "ئالا سامان", "ئاکام ھیمداد", "هانا ئاراس", "بێگەرد سۆما", "ئاوێنە کوێستان",
  ];
  const patients = await db
    .insert(patientsTable)
    .values(
      patientNames.map((n, i) => ({
        mrn: `MRN-${String(10001 + i).padStart(8, "0")}`,
        fullName: n,
        gender: i % 2 === 0 ? "male" : "female",
        dob: `19${60 + (i % 40)}-0${1 + (i % 9)}-1${i % 9}`,
        phone: `0770-${String(1000000 + i).slice(-7)}`,
        address: ["هەولێر", "سلێمانی", "دهۆک", "کەرکوک"][i % 4],
        bloodType: ["A+", "B+", "O+", "AB+", "A-", "O-"][i % 6],
        emergencyContact: `0750-${String(2000000 + i).slice(-7)}`,
      })),
    )
    .returning();

  // BEDS (3 wards × 4 rooms × 2 beds = 24 beds)
  const beds = await db
    .insert(bedsTable)
    .values(
      ["ناوخۆیی", "نەشتەرگەری", "منداڵان"].flatMap((ward) =>
        [101, 102, 103, 104].flatMap((room) =>
          ["A", "B"].map((bed) => ({
            ward,
            room: String(room),
            bedNumber: bed,
            occupied: false,
          })),
        ),
      ),
    )
    .returning();

  const doctors = staff.filter((s) => s.role === "doctor");
  const now = new Date();
  function daysAgo(n: number, hour = 9): Date {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    d.setHours(hour, 0, 0, 0);
    return d;
  }
  function daysAhead(n: number, hour = 9): Date {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  // OPD VISITS - spread over last 14 days + today
  const opdValues: (typeof opdVisitsTable.$inferInsert)[] = [];
  for (let d = 13; d >= 0; d--) {
    const count = 3 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      opdValues.push({
        patientId: patients[(d * 7 + i) % patients.length].id,
        doctorId: doctors[i % doctors.length].id,
        appointmentAt: daysAgo(d, 9 + (i % 8)),
        complaint: ["تای", "سەرئێشە", "زگئێشە", "گرژبوون", "ھەوکردن"][i % 5],
        diagnosis: d > 0 ? "ھەوکردنی گشتی" : null,
        status: d === 0 ? (i % 2 === 0 ? "scheduled" : "inprogress") : "done",
        fee: 25,
      });
    }
  }
  await db.insert(opdVisitsTable).values(opdValues);

  // ADMISSIONS — first 6 beds occupied
  const admValues: (typeof admissionsTable.$inferInsert)[] = [];
  for (let i = 0; i < 6; i++) {
    admValues.push({
      patientId: patients[i].id,
      bedId: beds[i].id,
      doctorId: doctors[i % doctors.length].id,
      admittedAt: daysAgo(i + 1, 12),
      reason: ["نەخۆشی شەکرە", "ھەوکردنی سییەکان", "گرژبوونی دڵ", "ئۆپەراسیۆن", "ھەوکردنی گەدە", "ساردبوونەوە"][i],
      status: "active",
      dailyRate: 50,
    });
  }
  await db.insert(admissionsTable).values(admValues);
  for (const b of beds.slice(0, 6)) {
    await db.execute(sql`UPDATE beds SET occupied = true WHERE id = ${b.id}`);
  }

  // EMERGENCY
  await db.insert(emergencyVisitsTable).values([
    { patientName: patients[10].fullName, patientId: patients[10].id, triage: "critical", complaint: "ھاوسەنگی نەدۆزراوە", arrivalAt: new Date(now.getTime() - 30 * 60000), status: "inprogress", assignedDoctorId: doctors[3].id },
    { patientName: patients[11].fullName, patientId: patients[11].id, triage: "urgent", complaint: "بریندارکردنی سەر", arrivalAt: new Date(now.getTime() - 60 * 60000), status: "waiting" },
    { patientName: patients[12].fullName, patientId: patients[12].id, triage: "urgent", complaint: "زگئێشەی توند", arrivalAt: new Date(now.getTime() - 90 * 60000), status: "inprogress", assignedDoctorId: doctors[1].id },
    { patientName: patients[13].fullName, patientId: patients[13].id, triage: "less_urgent", complaint: "تای بەرز", arrivalAt: new Date(now.getTime() - 120 * 60000), status: "waiting" },
    { patientName: "بێناو", triage: "nonurgent", complaint: "بریندارکردنی پێ", arrivalAt: new Date(now.getTime() - 180 * 60000), status: "discharged" },
  ]);

  // SURGERIES
  await db.insert(surgeriesTable).values([
    { patientId: patients[0].id, surgeonId: doctors[2].id, operatingRoom: "ژووری ١", scheduledAt: daysAhead(0, 11), procedureName: "ھەڵگرتنی ئاپێندیکس", anesthesia: "گشتی", status: "scheduled" },
    { patientId: patients[1].id, surgeonId: doctors[2].id, operatingRoom: "ژووری ٢", scheduledAt: daysAhead(0, 14), procedureName: "نەشتەرگەری گونەکان", anesthesia: "گشتی", status: "scheduled" },
    { patientId: patients[2].id, surgeonId: doctors[2].id, operatingRoom: "ژووری ١", scheduledAt: daysAhead(1, 9), procedureName: "ھەڵگرتنی بەردی گورچیلە", anesthesia: "گشتی", status: "scheduled" },
    { patientId: patients[3].id, surgeonId: doctors[2].id, operatingRoom: "ژووری ٣", scheduledAt: daysAgo(2, 10), procedureName: "ئۆپەراسیۆنی دڵ", anesthesia: "گشتی", status: "completed", notes: "بە سەرکەوتوویی" },
  ]);

  // LAB TESTS
  await db.insert(labTestsTable).values([
    { patientId: patients[0].id, doctorId: doctors[0].id, testName: "تاقیکردنەوەی خوێن", category: "blood", status: "completed", result: "نۆرماڵ", normalRange: "12-16 g/dL", price: 15 },
    { patientId: patients[1].id, doctorId: doctors[0].id, testName: "ئاستی شەکر", category: "biochemistry", status: "completed", result: "120 mg/dL", normalRange: "70-110 mg/dL", price: 10 },
    { patientId: patients[2].id, doctorId: doctors[1].id, testName: "تاقیکردنەوەی میز", category: "urine", status: "pending", price: 8 },
    { patientId: patients[3].id, doctorId: doctors[1].id, testName: "کۆلیستڕۆڵ", category: "biochemistry", status: "sample_collected", price: 12 },
    { patientId: patients[4].id, doctorId: doctors[0].id, testName: "هۆرمۆنەکانی غدەی دەرقیە", category: "biochemistry", status: "pending", price: 25 },
    { patientId: patients[5].id, doctorId: doctors[1].id, testName: "کشتوکاڵی بەکتریا", category: "microbiology", status: "pending", price: 30 },
  ]);

  // RADIOLOGY
  await db.insert(radiologyOrdersTable).values([
    { patientId: patients[0].id, doctorId: doctors[0].id, modality: "xray", bodyPart: "سنگ", status: "completed", report: "ھیچ کێشەیەکی ئاشکرا نییە", price: 20 },
    { patientId: patients[1].id, doctorId: doctors[1].id, modality: "ct", bodyPart: "مێشک", status: "pending", price: 80 },
    { patientId: patients[2].id, doctorId: doctors[2].id, modality: "mri", bodyPart: "ملوان", status: "completed", report: "گرژبوونی نەرمە", price: 150 },
    { patientId: patients[3].id, doctorId: doctors[1].id, modality: "ultrasound", bodyPart: "ھەناوی", status: "pending", price: 25 },
  ]);

  // MEDICATIONS
  const meds = await db
    .insert(medicationsTable)
    .values([
      { name: "پاراسیتامۆڵ ٥٠٠mg", category: "ئێشکوژ", unit: "tablet", stock: 500, reorderLevel: 100, price: 0.25, expiresOn: "2026-12-31", manufacturer: "GSK" },
      { name: "ئامۆکسیسیلین ٥٠٠mg", category: "دژەباکتریا", unit: "tablet", stock: 250, reorderLevel: 50, price: 0.5, expiresOn: "2026-08-31", manufacturer: "Pfizer" },
      { name: "ئایبۆپڕۆفین ٤٠٠mg", category: "ئێشکوژ", unit: "tablet", stock: 180, reorderLevel: 100, price: 0.3, expiresOn: "2026-11-30", manufacturer: "Bayer" },
      { name: "سیپڕۆفلۆکساسین ٥٠٠mg", category: "دژەباکتریا", unit: "tablet", stock: 8, reorderLevel: 30, price: 0.75, expiresOn: "2026-06-15", manufacturer: "Cipla" },
      { name: "میتفۆرمین ٨٥٠mg", category: "دژەشەکرە", unit: "tablet", stock: 320, reorderLevel: 60, price: 0.4, expiresOn: "2027-01-15", manufacturer: "Sanofi" },
      { name: "ئۆمێپڕازۆڵ ٢٠mg", category: "گەدە", unit: "tablet", stock: 220, reorderLevel: 50, price: 0.35, expiresOn: "2026-09-30", manufacturer: "Astra" },
      { name: "ڤیتامین D3 ١٠٠٠IU", category: "ڤیتامین", unit: "tablet", stock: 400, reorderLevel: 80, price: 0.2, expiresOn: "2027-03-31", manufacturer: "Nature" },
      { name: "ئنسولین تیپ بە تایبەت", category: "ھۆرمۆن", unit: "vial", stock: 12, reorderLevel: 15, price: 8, expiresOn: "2026-04-30", manufacturer: "Novo" },
      { name: "ئاسپرین ١٠٠mg", category: "خوێنڕەش", unit: "tablet", stock: 600, reorderLevel: 100, price: 0.15, expiresOn: "2027-07-31", manufacturer: "Bayer" },
      { name: "شەربەتی کۆکە", category: "کۆکە", unit: "bottle", stock: 45, reorderLevel: 20, price: 3, expiresOn: "2026-05-31", manufacturer: "GSK" },
    ])
    .returning();

  // PHARMACY SALES
  await db.insert(pharmacySalesTable).values([
    { patientName: patients[0].fullName, patientId: patients[0].id, medicationId: meds[0].id, quantity: 20, unitPrice: meds[0].price, total: meds[0].price * 20, soldAt: daysAgo(0, 10) },
    { patientName: patients[1].fullName, patientId: patients[1].id, medicationId: meds[1].id, quantity: 14, unitPrice: meds[1].price, total: meds[1].price * 14, soldAt: daysAgo(0, 11) },
    { patientName: patients[2].fullName, patientId: patients[2].id, medicationId: meds[2].id, quantity: 30, unitPrice: meds[2].price, total: meds[2].price * 30, soldAt: daysAgo(1, 14) },
    { patientName: patients[3].fullName, patientId: patients[3].id, medicationId: meds[4].id, quantity: 60, unitPrice: meds[4].price, total: meds[4].price * 60, soldAt: daysAgo(2, 9) },
  ]);

  // PRESCRIPTIONS
  await db.insert(prescriptionsTable).values([
    { patientId: patients[0].id, doctorId: doctors[0].id, medicationName: "پاراسیتامۆڵ ٥٠٠mg", dosage: "١ کرتە جار ٣ جار لە ڕۆژدا", duration: "٥ ڕۆژ", notes: "دوای خواردن", prescribedAt: daysAgo(0, 9) },
    { patientId: patients[1].id, doctorId: doctors[1].id, medicationName: "ئامۆکسیسیلین ٥٠٠mg", dosage: "١ کرتە ٣ جار", duration: "٧ ڕۆژ", prescribedAt: daysAgo(1, 11) },
    { patientId: patients[2].id, doctorId: doctors[0].id, medicationName: "ئۆمێپڕازۆڵ ٢٠mg", dosage: "١ پێش نان", duration: "١٤ ڕۆژ", prescribedAt: daysAgo(2, 10) },
  ]);

  // SHIFTS
  const shiftValues: (typeof shiftsTable.$inferInsert)[] = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d - 3);
    const dateStr = date.toISOString().slice(0, 10);
    for (let i = 0; i < 4; i++) {
      shiftValues.push({
        staffId: staff[(d + i) % staff.length].id,
        shiftDate: dateStr,
        shiftType: ["morning", "evening", "night"][i % 3],
      });
    }
  }
  await db.insert(shiftsTable).values(shiftValues);

  // LEAVES
  await db.insert(leavesTable).values([
    { staffId: staff[5].id, leaveType: "annual", fromDate: "2026-04-22", toDate: "2026-04-29", reason: "گەشت", status: "approved" },
    { staffId: staff[6].id, leaveType: "sick", fromDate: "2026-04-18", toDate: "2026-04-20", reason: "نەخۆشی", status: "approved" },
    { staffId: staff[8].id, leaveType: "emergency", fromDate: "2026-04-25", toDate: "2026-04-26", reason: "خانەوادە", status: "pending" },
  ]);

  // PAYROLL
  const payrollValues: (typeof payrollTable.$inferInsert)[] = [];
  for (const s of staff) {
    const base = s.salary ?? 1000;
    payrollValues.push({
      staffId: s.id,
      month: "2026-03",
      baseSalary: base,
      bonus: 100,
      deductions: 50,
      net: base + 100 - 50,
      paidAt: new Date("2026-04-01"),
    });
  }
  await db.insert(payrollTable).values(payrollValues);

  // INVOICES (over the last 14 days)
  const invValues: (typeof invoicesTable.$inferInsert)[] = [];
  for (let d = 13; d >= 0; d--) {
    const count = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const amount = 30 + Math.floor(Math.random() * 200);
      const paid = i % 3 === 0 ? amount : i % 3 === 1 ? amount / 2 : 0;
      invValues.push({
        patientId: patients[(d * 5 + i) % patients.length].id,
        items: ["سەردانی کلینیک + دەرمان", "تاقیکردنەوەی تاقیگە", "ئەشعە", "نەشتەرگەری", "ڕۆژێکی نوستن"][i % 5],
        amount,
        paidAmount: paid,
        status: paid >= amount ? "paid" : paid > 0 ? "partial" : "unpaid",
        paymentMethod: paid > 0 ? (i % 2 === 0 ? "cash" : "card") : null,
        createdAt: daysAgo(d, 10 + i),
      });
    }
  }
  await db.insert(invoicesTable).values(invValues);

  // INVENTORY
  await db.insert(inventoryItemsTable).values([
    { name: "گلوڤی پلاستیک", category: "ھەنگاوی پاکیزایی", quantity: 5000, unit: "دانە", reorderLevel: 1000, unitPrice: 0.05, supplier: "MedSupply" },
    { name: "ماسکی N95", category: "ھەنگاوی پاکیزایی", quantity: 800, unit: "دانە", reorderLevel: 200, unitPrice: 0.5, supplier: "3M" },
    { name: "سیرینگ ٥mL", category: "ئامرازی پزیشکی", quantity: 1200, unit: "دانە", reorderLevel: 300, unitPrice: 0.1, supplier: "BD" },
    { name: "بانداج", category: "ئامرازی پزیشکی", quantity: 60, unit: "ڕۆڵ", reorderLevel: 100, unitPrice: 1.5, supplier: "Johnson" },
    { name: "ئالکۆڵ پاککەرەوە ٥٠٠mL", category: "پاککردنەوە", unit: "بۆتڵ", quantity: 90, reorderLevel: 30, unitPrice: 2, supplier: "MedSupply" },
    { name: "ھولکەی پەرستار", category: "جلوبەرگ", unit: "پارچە", quantity: 150, reorderLevel: 50, unitPrice: 12, supplier: "MediWear" },
  ]);

  console.log("Seed complete");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
