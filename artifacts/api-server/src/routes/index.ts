import { Router } from "express";
import contactRouter from "./contact";
import healthRouter from "./health";

const router = Router();

router.use(healthRouter);
router.use(contactRouter);

export default router;
