import { Router, type IRouter, type RequestHandler } from "express";
import { requireAuth, type Role } from "../lib/auth";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import patientsRouter from "./patients";
import staffRouter from "./staff";
import opdRouter from "./opd";
import ipdRouter from "./ipd";
import emergencyRouter from "./emergency";
import surgeryRouter from "./surgery";
import labRouter from "./lab";
import radiologyRouter from "./radiology";
import pharmacyRouter from "./pharmacy";
import prescriptionsRouter from "./prescriptions";
import hrRouter from "./hr";
import billingRouter from "./billing";
import inventoryRouter from "./inventory";

const router: IRouter = Router();

// public
router.use(healthRouter);
router.use(authRouter);

// every other route requires a valid JWT
router.use(requireAuth);

// path-prefix → allowed roles (first match wins, "*" = any signed-in user)
const ALL_ROLES: Role[] = [
  "admin", "manager", "doctor", "nurse", "pharmacist", "cashier", "labtech", "radtech",
];
const RBAC: Array<{ prefix: RegExp; roles: Role[] }> = [
  { prefix: /^\/dashboard(\/|$)/, roles: ALL_ROLES },
  { prefix: /^\/patients(\/|$)/, roles: ALL_ROLES },
  { prefix: /^\/beds(\/|$)/, roles: ALL_ROLES },
  { prefix: /^\/staff(\/|$)/, roles: ["admin", "manager"] },
  { prefix: /^\/(shifts|leaves|payroll)(\/|$)/, roles: ["admin", "manager"] },
  { prefix: /^\/opd-visits(\/|$)/, roles: ["admin", "manager", "doctor", "nurse"] },
  { prefix: /^\/admissions(\/|$)/, roles: ["admin", "manager", "doctor", "nurse"] },
  { prefix: /^\/emergency-visits(\/|$)/, roles: ["admin", "manager", "doctor", "nurse"] },
  { prefix: /^\/surgeries(\/|$)/, roles: ["admin", "manager", "doctor", "nurse"] },
  { prefix: /^\/lab(-|\/|$)/, roles: ["admin", "manager", "doctor", "nurse", "labtech"] },
  { prefix: /^\/radiology(-|\/|$)/, roles: ["admin", "manager", "doctor", "nurse", "radtech"] },
  { prefix: /^\/medications(\/|$)/, roles: ["admin", "manager", "doctor", "pharmacist"] },
  { prefix: /^\/pharmacy(-|\/|$)/, roles: ["admin", "manager", "doctor", "pharmacist"] },
  { prefix: /^\/prescriptions(\/|$)/, roles: ["admin", "manager", "doctor", "nurse", "pharmacist"] },
  { prefix: /^\/invoices(\/|$)/, roles: ["admin", "manager", "cashier"] },
  { prefix: /^\/billing(\/|$)/, roles: ["admin", "manager", "cashier"] },
  { prefix: /^\/inventory(-|\/|$)/, roles: ["admin", "manager", "pharmacist"] },
];

const rbac: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: "نەناسراو" });
    return;
  }
  const rule = RBAC.find((r) => r.prefix.test(req.path.toLowerCase()));
  if (!rule) {
    next();
    return;
  }
  if (!rule.roles.includes(req.user.role)) {
    res.status(403).json({ error: "ڕێگەپێدراو نییە" });
    return;
  }
  next();
};

router.use(rbac);

router.use(dashboardRouter);
router.use(patientsRouter);
router.use(staffRouter);
router.use(opdRouter);
router.use(ipdRouter);
router.use(emergencyRouter);
router.use(surgeryRouter);
router.use(labRouter);
router.use(radiologyRouter);
router.use(pharmacyRouter);
router.use(prescriptionsRouter);
router.use(hrRouter);
router.use(billingRouter);
router.use(inventoryRouter);

export default router;
