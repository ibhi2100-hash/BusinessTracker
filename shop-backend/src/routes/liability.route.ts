import { Router } from "express";
import { LiabilityController } from "../modules/liability/controller/liability.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { isAdminMiddleware } from "../middlwares/isAdmin.middleware.js";

const router = Router();
const controller = new LiabilityController();

router.use(authMiddleware, isAdminMiddleware);

router.post("/", controller.create);
router.get("/", controller.list);
router.post("/:liabilityId/repay", controller.repay);

export default router;
