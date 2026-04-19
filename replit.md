# سیستەمی بەڕێوەبردنی نەخۆشخانە (Kurdish Hospital Management System)

A complete hospital management system entirely in Kurdish Sorani (RTL), built as a data-visualization artifact in the pnpm monorepo template.

## Architecture

- **Frontend**: `artifacts/hospital-system` — React + Vite + Tailwind + shadcn/ui + Recharts + TanStack Query/Table + Wouter + Zustand. RTL layout, Vazirmatn font, teal primary palette.
- **Backend**: `artifacts/api-server` — Express + Drizzle ORM (PostgreSQL). Per-domain routers in `src/routes/*`.
- **Schema**: `lib/db/src/schema` — 17 tables (staff, patients, beds, opd_visits, admissions, emergency_visits, surgeries, lab_tests, radiology_orders, medications, pharmacy_sales, prescriptions, shifts, leaves, payroll, invoices, inventory_items).
- **API contract**: `lib/api-spec/openapi.yaml` (60+ endpoints). Codegen produces `@workspace/api-zod` (server-side validators) and `@workspace/api-client-react` (typed React Query hooks).

## Modules
Dashboard, Patients, Staff/HR (Staff/Shifts/Leaves/Payroll), OPD, IPD/Admissions (with bed tracking), Emergency (triage), Surgery, Lab, Radiology, Pharmacy (medications + sales w/ stock deduction), Prescriptions, Billing (invoices + partial payments), Inventory.

## Auth
Demo auth: `POST /api/auth/login` with `{username, password}` issues `tok_{id}_{ts}` bearer; `GET /api/auth/me` decodes it; `GET /api/auth/users` returns the demo account list (with passwords) for the login picker. 12 seeded staff covering every role: admin, doctor (×4), nurse (×2), pharmacist, cashier, labtech, radtech, manager.

## Seed data
`pnpm --filter @workspace/api-server exec tsx src/seed.ts` — 12 staff, 30 patients, 24 beds (6 occupied), 14 days of OPD/invoice history, 5 emergency visits, 4 surgeries, lab/radiology orders, 10 medications, prescriptions, shifts/leaves/payroll, 6 inventory items.

## Conventions
- All UI text: Kurdish Sorani only.
- Generated query hooks return `T` directly; mutations take `{ data: T }`.
- After mutations, invalidate caches with the matching `get*QueryKey()` export.
- Do **not** re-export `./generated/types` from `lib/api-zod/src/index.ts` (causes TS2308).
- API base URL is `/api` (relative); the workspace proxy routes `/api/*` to the api-server artifact.
