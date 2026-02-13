import { User } from "../modules/auth/entity/user.ts";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}