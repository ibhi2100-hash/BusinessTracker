import { AuthUser } from "./auth-user";
import { BusinessSubscription, SubscriptionPlan } from "../infrastructure/postgresql/prisma/generated/client.ts";

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser,
            subscription?: BusinessSubscription & {
                subscription: SubscriptionPlan
            }
        }
    }
}

export {}