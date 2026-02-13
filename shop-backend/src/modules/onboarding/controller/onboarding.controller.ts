import type { Request, Response } from "express";
import { OnboardingService } from '../service/onboarding.service.js'

export class OnboardingController {
    constructor(private onboardingService: OnboardingService){}


    async createBusiness(req: Request, res: Response){
        const user = req?.user;
        const dto = req.body;
       

        const result = await this.onboardingService.createBusiness(user!.id, dto);

        const { token } = result;

        res.cookie("token", token , {
            httpOnly: true,
            secure: false, 
            sameSite: "lax",
        })

        return res.status(201).json(result)
    }
}