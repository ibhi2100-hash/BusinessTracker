import { ResolveFnOutput } from "node:module";
import { SubscriptionService } from "../service/subscription.service.js";
import { response, type Request, type Response } from "express";

export class SubscriptionController {
    constructor(private service: SubscriptionService){}

    getSubscription =async (req: Request, res: Response) => {
        const subscription = await this.service.getSubscriptionPlan()

        return res.json(subscription)
    }

    initializeSubscriptionPayment = async (req: Request, res: Response)=> {
        const businessId = req.user.businessId;
        const user = req.user;
        const { planId } = req.body;
        
        if(!planId) {
            return res.status(401).json({ message: " Choose Your plan, PlanId does not exist"})
        }
        const result = await this.service.initializeSubscriptionPayment(businessId, planId, user)

        return res.status(201).json(result)
    }

    create = async (req: Request, res: Response)=> {

    }

    paystackWebhook = async (req: Request, res: Response) => {

    const event = req.body;

    if (event.event === "charge.success") {

        const metadata = event.data.metadata;

        const businessId = metadata.businessId;
        const planId = metadata.planId;

        await this.service.createPlan(businessId, planId)
    }

    res.sendStatus(200);

    };
    verifyPayment = async ( req: Request, res: Response)=> {
        const { reference } = req.query;

        if (!reference) {
            return res.status(400).json({ message: "Reference is required" });
        }
        try {
            const result = await this.service.verifyPayment(reference as string);
            return res.json(result);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    webhooks = async (req: Request, res: Response)=> {

    }
}