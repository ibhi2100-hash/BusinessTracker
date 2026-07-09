import { SQLiteAuthRepository } from "../offline/repositories/SQLiteAuthRepository/SQLiteAuthRepository";
import { User } from "@business/shared-types";
import { Session } from "../offline/repositories/SQLiteSessionRepository/SessionInterface";
import { SQLiteSessionRepository } from "../offline/repositories/SQLiteSessionRepository/SQLiteSessionRepository";
import { uuid } from "zod";

interface RegisterResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}
export class AuthService {

    constructor(

        private readonly repository: SQLiteAuthRepository,
        private readonly session: SQLiteSessionRepository

    ) {}

    async register(result: RegisterResponse): Promise<User> {

        const user: User = {

            id: result.user.id,

            businessId: result.user.businessId,

            branchId: result.user.branchId,

            name: result.user.name,

            email: result.user.email,

            role: result.user.role,

            onboardingCompleted: false,

            isActive: true,

            version: 0,

            lastEventId: null,

            createdAt: new Date(Date.now()),

            updatedAt: null

        };

        return this.repository.addUser(user);

    }

    async saveSession(sessionData: any){
        const id = crypto.randomUUID();
        const createdAt = Date.now();;
        const { user, refreshToken, refreshExpiresIn, accessToken } = sessionData;
        const  expiresAt = createdAt + refreshExpiresIn * 1000

        return this.session.saveSession({
            id,
            userId: user.id,
            refreshToken,
            accessToken,
            expiresAt,
            createdAt

        })
    }

    async getCurrentSession(){
        const userSession = await this.session.getCurrentSession();
        
        return userSession
    }

    async clearSession(){
        await this.session.clearSession()
    }

}