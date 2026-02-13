import type{ Request, Response } from "express";
import { AuthService } from "../service/auth.service.js";
import { LoginDto } from "../dto/login.dto.js";
import { RegisterDto } from "../dto/register.dto.js";
import { signToken } from "../../../helpers/jwtHelper/jwthelper.js";

export class AuthController {
    private authService: AuthService;
    constructor(authService: AuthService) {
        this.authService = authService;
    }
    async register(req: Request, res: Response): Promise<Response> {
   
        try{
            const result = await this.authService.registerUser(req.body);
            if (!result) {
                return res.status(400).json({ message: "Registration failed" });
            }
            const { user, token } = result;

            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 1000 * 60 *60 * 24
            })
            return res.status(201).json({ user });
        } catch (error: any) {
            if (error.message === "Email already in use") {
                return res.status(409).json({ message: error.message });
            }
            return res.status(400).json({ message: error instanceof Error ? error.message : String(error)});
        }
    }
    async login(req: Request, res: Response): Promise<Response> {
        const dto: LoginDto = req.body;
        try {
        const result = await this.authService.loginUser(dto);
        if (!result) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const { user, token  } = result

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24
        })
        
        return res.status(200).json({ user });
        } catch (error: any) {
            if (error.message === "User not found" || error.message === "Invalid password") {
                return res.status(401).json({ message: error.message });
            }
            return res.status(500).json({ message: error instanceof Error ? error.message : String(error)});
        }
    }
    async logMeIn(){
        
    }
}