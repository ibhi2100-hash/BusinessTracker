import { Router } from "express";
import { AlertRepository } from "../modules/alerts/repository/alerts.repository.js";
import { AlertService } from "../modules/alerts/service/alerts.service.js";
import { AlertController } from "../modules/alerts/controller/alerts.controllet.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { requireBranch } from "../middlwares/requireBranch.middleware.js";

const router = Router();

const repo = new AlertRepository();
const service = new AlertService(repo);
const controller = new AlertController(service);

router.use(authMiddleware, requireBranch);

router.get("/", controller.getBranchAlerts.bind(controller));
router.patch("/:id/read", controller.markAsRead.bind(controller));
router.patch("/:id/resolve", controller.resolveAlert.bind(controller));

export default router;