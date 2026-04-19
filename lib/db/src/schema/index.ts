import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

// خشتەی کارمەندان (Staff/HR) - زانیاری هەموو بەکارهێنەرانی سیستەم
export const staffTable = pgTable("staff", {
  id: serial("id").primaryKey(), // ناسنامەی سەرەکی
  fullName: text("full_name").notNull(), // ناوی تەواو
  username: text("username").notNull().unique(), // ناوی بەکارهێنەر (دەبێت تاقانە بێت)
  password: text("password").notNull(), // تێپەڕەوشە (Hash کراو)
  role: text("role").notNull(), // پایە (doctor, nurse, admin, هتد)
  department: text("department"), // بەش (بۆ نمونە: فریاگوزاری)
  phone: text("phone"), // ژمارەی تەلەفۆن
  salary: real("salary"), // موچەی بنەڕەتی
  joinedAt: timestamp("joined_at", { withTimezone: true }) // بەرواری دامەزراندن
    .notNull()
    .defaultNow(),
});

// خشتەی نەخۆشەکان (Patients Master Table)
export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(), // ناسنامە
  mrn: text("mrn").notNull().unique(), // ژمارەی تۆماری پزیشکی (MRN)
  fullName: text("full_name").notNull(), // ناوی نەخۆش
  gender: text("gender").notNull(), // ڕەگەز
  dob: date("dob", { mode: "date" }), // بەرواری لەدایکبوون
  phone: text("phone"), // تەلەفۆن
  address: text("address"), // ناونیشان
  bloodType: text("blood_type"), // جۆری خوێن
  emergencyContact: text("emergency_contact"), // ژمارەی فریاگوزاری
  notes: text("notes"), // تێبینی گشتی
  createdAt: timestamp("created_at", { withTimezone: true }) // کاتی تۆمارکردن
    .notNull()
    .defaultNow(),
});

// خشتەی سەردانی نۆرینگەی دەرەکی (Out-patient Department)
export const opdVisitsTable = pgTable("opd_visits", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(), // ناسنامەی نەخۆش
  doctorId: integer("doctor_id").notNull(), // ناسنامەی پزیشک
  appointmentAt: timestamp("appointment_at", { withTimezone: true }).notNull(), // کاتی چاوپێکەوتن
  complaint: text("complaint"), // گلەیی نەخۆش
  diagnosis: text("diagnosis"), // دەستنیشانکردنی نەخۆشی
  status: text("status").notNull().default("scheduled"), // دۆخ (scheduled, completed, cancelled)
  fee: real("fee").notNull().default(0), // کرێی بینین
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// خشتەی جێگاکانی نەخۆشخانە
export const bedsTable = pgTable("beds", {
  id: serial("id").primaryKey(),
  room: text("room").notNull(), // ژمارەی ژوور
  bedNumber: text("bed_number").notNull(), // ژمارەی جێگا
  ward: text("ward").notNull(), // قاوش/بەش (بۆ نمونە: پیاوان)
  occupied: boolean("occupied").notNull().default(false), // ئایا جێگاکە گیراوە؟
});

// خشتەی خەوتنی نەخۆش (In-patient Admissions)
export const admissionsTable = pgTable("admissions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  bedId: integer("bed_id").notNull(), // ناسنامەی جێگا
  doctorId: integer("doctor_id").notNull(), // پزیشکی بەرپرس
  admittedAt: timestamp("admitted_at", { withTimezone: true }) // کاتی داخلبوون
    .notNull()
    .defaultNow(),
  dischargedAt: timestamp("discharged_at", { withTimezone: true }), // کاتی دەرچوون
  reason: text("reason"), // هۆکاری خەواندن
  status: text("status").notNull().default("active"), // دۆخ (active, discharged)
  dailyRate: real("daily_rate").notNull().default(0), // کرێی ڕۆژانەی مانەوە
});

// خشتەی فریاگوزاری (Emergency Room)
export const emergencyVisitsTable = pgTable("emergency_visits", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(), // ناوی نەخۆش (کاتێک تۆماری فەرمی نییە)
  patientId: integer("patient_id"), // ناسنامە (ئەگەر هەبێت)
  triage: text("triage").notNull(), // جۆری حاڵەت (Critical, Urgent, Stable)
  complaint: text("complaint").notNull(), // گلەیی سەرەکی
  arrivalAt: timestamp("arrival_at", { withTimezone: true }) // کاتی گەیشتن
    .notNull()
    .defaultNow(),
  status: text("status").notNull().default("waiting"), // دۆخی فریاگوزاری
  assignedDoctorId: integer("assigned_doctor_id"), // پزیشکی ڕاسپێردراو
});

// خشتەی نەشتەرگەرییەکان (Surgeries)
export const surgeriesTable = pgTable("surgeries", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  surgeonId: integer("surgeon_id").notNull(), // نۆرینگەی نەشتەرگەر
  operatingRoom: text("operating_room").notNull(), // هۆڵی نەشتەرگەری
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(), // کاتی ئەنجامدان
  procedureName: text("procedure_name").notNull(), // جۆری نەشتەرگەری
  anesthesia: text("anesthesia"), // جۆری بەنج
  status: text("status").notNull().default("scheduled"), // دۆخ (scheduled, completed, cancelled)
  notes: text("notes"),
});

// خشتەی پشکنینەکانی تاقیگە
export const labTestsTable = pgTable("lab_tests", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(), // پزیشکی داواکار
  testName: text("test_name").notNull(), // ناوی پشکنین
  category: text("category").notNull(), // پۆلێن (خوێن، میز، هتد)
  requestedAt: timestamp("requested_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  status: text("status").notNull().default("pending"), // دۆخ (pending, completed)
  result: text("result"), // ئەنجام
  normalRange: text("normal_range"), // ڕێژەی ئاسایی
  price: real("price").notNull().default(0), // کرێی پشکنین
});

// خشتەی داواکارییەکانی تیشک و سۆنەر (Radiology)
export const radiologyOrdersTable = pgTable("radiology_orders", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  modality: text("modality").notNull(), // جۆر (X-Ray, MRI, CT Scan)
  bodyPart: text("body_part").notNull(), // بەشی جەستە
  requestedAt: timestamp("requested_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  status: text("status").notNull().default("pending"),
  report: text("report"), // ڕاپۆرتی پزیشکی تیشک
  imageUrl: text("image_url"), // لینک بۆ وێنەی تیشکەکە
  price: real("price").notNull().default(0),
});

// خشتەی دەرمانەکان (Medication Inventory)
export const medicationsTable = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // ناوی دەرمان
  category: text("category"), // پۆلێن
  unit: text("unit").notNull(), // جۆر (tablet, bottle, vial)
  stock: integer("stock").notNull().default(0), // بڕی بەردەست
  reorderLevel: integer("reorder_level").notNull().default(10), // ئاستی ئاگادارکردنەوەی کەمبوونەوە
  price: real("price").notNull().default(0), // نرخی دانە
  expiresOn: date("expires_on", { mode: "date" }), // بەرواری بەسەرچوون
  manufacturer: text("manufacturer"), // کۆمپانیای بەرهەمهێنەر
});

// خشتەی فرۆشتنی دەرمان (Pharmacy Sales)
export const pharmacySalesTable = pgTable("pharmacy_sales", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(), // ناوی کڕیار
  patientId: integer("patient_id"), // ناسنامە (ئەگەر هەبێت)
  medicationId: integer("medication_id").notNull(), // ناسنامەی دەرمان
  quantity: integer("quantity").notNull(), // بڕی فرۆشراو
  unitPrice: real("unit_price").notNull(), // نرخی دانە لە کاتی فرۆشتن
  total: real("total").notNull(), // کۆی گشتی
  soldAt: timestamp("sold_at", { withTimezone: true }).notNull().defaultNow(),
});

// خشتەی نوسخەی پزیشکی (Prescriptions)
export const prescriptionsTable = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  medicationName: text("medication_name").notNull(), // ناوی دەرمان
  dosage: text("dosage").notNull(), // بڕی بەکارهێنان (وەک: ٢ جار لە ڕۆژێکدا)
  duration: text("duration").notNull(), // ماوەی بەکارهێنان (وەک: ٥ ڕۆژ)
  notes: text("notes"),
  prescribedAt: timestamp("prescribed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// خشتەی خشتەی دەوامی ستاف (Staff Shifts)
export const shiftsTable = pgTable("shifts", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull(),
  shiftDate: date("shift_date", { mode: "date" }).notNull(), // ڕێکەوتی دەوام
  shiftType: text("shift_type").notNull(), // جۆر (morning, evening, night)
  notes: text("notes"),
});

// خشتەی مۆڵەتی کارمەندان (Leaves)
export const leavesTable = pgTable("leaves", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull(),
  leaveType: text("leave_type").notNull(), // جۆر (annual, sick, emergency)
  fromDate: date("from_date", { mode: "date" }).notNull(), // لە ڕێکەوتی
  toDate: date("to_date", { mode: "date" }).notNull(), // بۆ ڕێکەوتی
  reason: text("reason"), // هۆکار
  status: text("status").notNull().default("pending"), // دۆخی مۆڵەت (pending, approved, rejected)
});

// خشتەی موچە و شایستە داراییەکان (Payroll)
export const payrollTable = pgTable("payroll", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull(),
  month: text("month").notNull(), // مانگ (وەک: 2024-03)
  baseSalary: real("base_salary").notNull(), // موچەی بنەڕەتی
  bonus: real("bonus").notNull().default(0), // پاداشت
  deductions: real("deductions").notNull().default(0), // لێبڕینەکان
  net: real("net").notNull(), // کۆی گشتی پارەی وەرگیراو (پاش پاداشت و لێبڕین)
  paidAt: timestamp("paid_at", { withTimezone: true }), // کاتی پارەدان
});

// خشتەی پسوولە داراییەکانی نەخۆش (Patient Invoices)
export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  items: text("items").notNull(), // لیستی خزمەتگوزارییەکان (وەک: پشکنینی خوێن)
  amount: real("amount").notNull(), // بڕی گشتی پارە
  paidAmount: real("paid_amount").notNull().default(0), // ئەو بڕەی دراوە
  status: text("status").notNull().default("unpaid"), // دۆخ (unpaid, partial, paid)
  paymentMethod: text("payment_method"), // شێواز (cash, card)
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// خشتەی کەلوپەلی کۆگا (General Inventory Items)
export const inventoryItemsTable = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // ناوی کەلوپەل
  category: text("category").notNull(), // پۆلێن
  quantity: integer("quantity").notNull().default(0), // بڕی بەردەست
  unit: text("unit").notNull(), // یەکە (وەک: کارتۆن، سێت)
  reorderLevel: integer("reorder_level").notNull().default(0), // ئاستی کەمبوونەوەی کەلوپەل
  unitPrice: real("unit_price").notNull().default(0), // نرخی کڕین (بۆ یەک دانە)
  supplier: text("supplier"), // کۆمپانیای دابینکەر
});

// خشتەی مێژووی گۆڕانکارییەکانی کۆگا (Inventory Audit Trail)
export const inventoryTransactionsTable = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(), // ناسنامەی کەلوپەل
  staffId: integer("staff_id"), // ئەو کەسەی گۆڕانکارییەکەی کردووە
  change: integer("change").notNull(), // بڕی گۆڕان (نمونە: +٥٠ یان -١٠)
  type: text("type").notNull(), // جۆری کرداری کۆگا (in, out, adjustment)
  reason: text("reason"), // هۆکاری گۆڕانکاری (وەک: پێداویستی بەشی فریاگوزاری)
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// خشتەی نیشانە سەرەکییەکانی نەخۆش (Vital Signs Table)
export const vitalsTable = pgTable("vitals", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(), // ناسنامەی نەخۆش
  heartRate: integer("heart_rate"), // لێدانی دڵ (BPM)
  bloodPressure: text("blood_pressure"), // پەستانی خوێن (وەک: 120/80)
  temperature: real("temperature"), // پلەی گەرمی (Celsius)
  spO2: integer("sp_o2"), // ڕێژەی ئۆکسجین (%)
  respiratoryRate: integer("respiratory_rate"), // ڕێژەی هەناسەدان
  recordedBy: integer("recorded_by"), // ئەو کارمەندەی تۆماری کردووە
  recordedAt: timestamp("recorded_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// خشتەی ئاگادارکردنەوەکانی سیستەم (Notifications Table)
export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id"), // ئەو کارمەندەی ئاگادارکردنەوەکە وەردەگرێت (ئەگەر بۆ هەموو نەبێت)
  title: text("title").notNull(), // ناوی ئاگادارکردنەوە
  message: text("message").notNull(), // ناوەڕۆک
  type: text("type").notNull().default("info"), // جۆر (info, warning, critical)
  read: boolean("read").notNull().default(false), // ئایا خوێندراوەتەوە؟
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// خشتەی بانکی خوێن (Blood Bank Inventory)
export const bloodInventoryTable = pgTable("blood_inventory", {
  id: serial("id").primaryKey(),
  bloodGroup: text("blood_group").notNull().unique(), // جۆری خوێن وەکو A+, B-, O+
  units: integer("units").notNull().default(0), // ژمارەی کیسی خوێنی بەردەست
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(), // دواجار کەی نوێکراوەتەوە
});
