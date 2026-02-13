import express from "express";
import { Request, Response } from "express";
import { AuthRepository } from "../modules/auth/repository/auth.repository.js";
import { AuthService } from "../modules/auth/service/auth.service.js";
import { AuthController } from "../modules/auth/controller/auth.controller.js";

const router = express.Router();

const authRepo = new AuthRepository();
const authService = new AuthService(authRepo);
const authController = new AuthController(authService);

/*=============================================
                    
                 Register Route
                        
=============================================*/
router.post("/register", authController.register.bind(authController));

/*=============================================
                    
                   Login Route

=============================================*/
router.post("/login", authController.login.bind(authController));

export default router;