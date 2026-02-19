import { AuthUser } from "./auth-user.ts";

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}