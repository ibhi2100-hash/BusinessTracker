import { Router } from "express";
import { OnboardingController } from "../modules/onboarding/controller/onboarding.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { isAdminMiddleware } from "../middlwares/isAdmin.middleware.js";
import { OnboardingService } from "../modules/onboarding/service/onboarding.service.js";
import { AuthService } from "../modules/auth/service/auth.service.js";
import { AuthRepository } from "../modules/auth/repository/auth.repository.js";

const router = Router()
const authRepo = new AuthRepository()
const authService = new AuthService(authRepo)
const onboardingService = new OnboardingService(authService)
const onboardingController = new OnboardingController(onboardingService);

router.post('/create', authMiddleware, isAdminMiddleware, onboardingController.createBusiness.bind(onboardingController))


export default router;