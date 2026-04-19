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

export const staffTable = pgTable("staff", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  department: text("department"),
  phone: text("phone"),
  salary: real("salary"),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  mrn: text("mrn").notNull().unique(),
  fullName: text("full_name").notNull(),
  gender: text("gender").notNull(),
  dob: date("dob", { mode: "date" }),
  phone: text("phone"),
  address: text("address"),
  bloodType: text("blood_type"),
  emergencyContact: text("emergency_contact"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const opdVisitsTable = pgTable("opd_visits", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  appointmentAt: timestamp("appointment_at", { withTimezone: true }).notNull(),
  complaint: text("complaint"),
  diagnosis: text("diagnosis"),
  status: text("status").notNull().default("scheduled"),
  fee: real("fee").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const bedsTable = pgTable("beds", {
  id: serial("id").primaryKey(),
  room: text("room").notNull(),
  bedNumber: text("bed_number").notNull(),
  ward: text("ward").notNull(),
  occupied: boolean("occupied").notNull().default(false),
});

export const admissionsTable = pgTable("admissions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  bedId: integer("bed_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  admittedAt: timestamp("admitted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dischargedAt: timestamp("discharged_at", { withTimezone: true }),
  reason: text("reason"),
  status: text("status").notNull().default("active"),
  dailyRate: real("daily_rate").notNull().default(0),
});

export const emergencyVisitsTable = pgTable("emergency_visits", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  patientId: integer("patient_id"),
  triage: text("triage").notNull(),
  complaint: text("complaint").notNull(),
  arrivalAt: timestamp("arrival_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  status: text("status").notNull().default("waiting"),
  assignedDoctorId: integer("assigned_doctor_id"),
});

export const surgeriesTable = pgTable("surgeries", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  surgeonId: integer("surgeon_id").notNull(),
  operatingRoom: text("operating_room").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  procedureName: text("procedure_name").notNull(),
  anesthesia: text("anesthesia"),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
});

export const labTestsTable = pgTable("lab_tests", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  testName: text("test_name").notNull(),
  category: text("category").notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  status: text("status").notNull().default("pending"),
  result: text("result"),
  normalRange: text("normal_range"),
  price: real("price").notNull().default(0),
});

export const radiologyOrdersTable = pgTable("radiology_orders", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  modality: text("modality").notNull(),
  bodyPart: text("body_part").notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  status: text("status").notNull().default("pending"),
  report: text("report"),
  imageUrl: text("image_url"),
  price: real("price").notNull().default(0),
});

export const medicationsTable = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  unit: text("unit").notNull(),
  stock: integer("stock").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(10),
  price: real("price").notNull().default(0),
  expiresOn: date("expires_on", { mode: "date" }),
  manufacturer: text("manufacturer"),
});

export const pharmacySalesTable = pgTable("pharmacy_sales", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  patientId: integer("patient_id"),
  medicationId: integer("medication_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  total: real("total").notNull(),
  soldAt: timestamp("sold_at", { withTimezone: true }).notNull().defaultNow(),
});

export const prescriptionsTable = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage").notNull(),
  duration: text("duration").notNull(),
  notes: text("notes"),
  prescribedAt: timestamp("prescribed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const shiftsTable = pgTable("shifts", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull(),
  shiftDate: date("shift_date", { mode: "date" }).notNull(),
  shiftType: text("shift_type").notNull(),
  notes: text("notes"),
});

export const leavesTable = pgTable("leaves", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull(),
  leaveType: text("leave_type").notNull(),
  fromDate: date("from_date", { mode: "date" }).notNull(),
  toDate: date("to_date", { mode: "date" }).notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("pending"),
});

export const payrollTable = pgTable("payroll", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull(),
  month: text("month").notNull(),
  baseSalary: real("base_salary").notNull(),
  bonus: real("bonus").notNull().default(0),
  deductions: real("deductions").notNull().default(0),
  net: real("net").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  items: text("items").notNull(),
  amount: real("amount").notNull(),
  paidAmount: real("paid_amount").notNull().default(0),
  status: text("status").notNull().default("unpaid"),
  paymentMethod: text("payment_method"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const inventoryItemsTable = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull(),
  reorderLevel: integer("reorder_level").notNull().default(0),
  unitPrice: real("unit_price").notNull().default(0),
  supplier: text("supplier"),
});
