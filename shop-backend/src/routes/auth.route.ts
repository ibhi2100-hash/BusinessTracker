import express from "express";
import { AuthRepository } from "../modules/auth/repository/auth.repository.js";
import { AuthService } from "../modules/auth/service/auth.service.js";
import { AuthController } from "../modules/auth/controller/auth.controller.js";
import { authMiddleware } from "../middlwares/auth.middleware.js";
import { SessionRepository } from "../modules/auth/repository/session.repository.js";
import { TokenService } from "../modules/auth/service/token.service.js";
import { SessionService } from "../modules/auth/service/session.service.js"

const router = express.Router();
const sessionRepo = new SessionRepository()
const tokenService = new TokenService();
const sessionService = new SessionService(sessionRepo, tokenService)
const authRepo = new AuthRepository();
const authService = new AuthService(authRepo, tokenService, sessionService);
const authController = new AuthController(authService);

/*=============================================
                    
                 Register Route
                        
=============================================*/
router.post("/register", authController.register.bind(authController));

/*=============================================
                    
                   Login Route

=============================================*/
router.post("/login", authController.login.bind(authController));

router.post(
  "/refresh",
  authController.refresh.bind(authController)
);

router.post(
  "/logout",
  authController.logout.bind(authController)
);


router.get("/me", authMiddleware, authController.me.bind(authController));

export default router;