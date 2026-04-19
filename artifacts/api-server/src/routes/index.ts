import { Router, type IRouter } from "express";
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

router.use(healthRouter);
router.use(authRouter);
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
