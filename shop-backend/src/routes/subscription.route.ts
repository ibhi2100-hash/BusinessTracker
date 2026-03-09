import { authMiddleware } from "../middlwares/auth.middleware.js";
import { SubscriptionController } from "../modules/subscription/controller/subscription.controller.js";
import { SubscriptionRepository } from "../modules/subscription/repository/subscription.repository.js";
import { SubscriptionService } from "../modules/subscription/service/subscription.service.js";
import { Router } from "express";

const repo = new SubscriptionRepository();
const service = new SubscriptionService(repo);
const controller = new SubscriptionController(service);


const router = Router();

router.use(authMiddleware)

router.get("/plans", controller.getSubscription)

router.post("/create", controller.create)

router.post("/initialize-payment", controller.initializeSubscriptionPayment);

router.post("/verify-payment", controller.verifyPayment)

router.post("webhooks/paystack", controller.webhooks)

export default router;