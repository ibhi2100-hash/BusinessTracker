
import { User } from "@business/shared-types";
import { SQLiteSessionRepository } from "../repositories/SQLiteSessionRepository/SQLiteSessionRepository";
import { SQLiteAuthRepository } from "../repositories/SQLiteAuthRepository/SQLiteAuthRepository";
import { SQLiteApplicationStateRepository } from "../repositories/ApplicationStateRepository.ts/SQLiteApplicationStateRepository";


interface RegisterResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}
export class RegistrationService {

    constructor(

        private readonly repository: SQLiteAuthRepository,
        private readonly session: SQLiteSessionRepository,
        private readonly applicationState: SQLiteApplicationStateRepository,

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

            createdAt: Date.now(),

            updatedAt: null

        };
        const userRegisterd = await this.repository.addUser(user)
        console.log("User Registerd: ", userRegisterd)
        return userRegisterd

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

  async saveApplicationState(userId: string) {

    console.log("applicationState =", this.applicationState);

    console.log(
        "setCurrentUser =",
        this.applicationState?.setCurrentUser
    );

    const session = await this.getCurrentSession();

    await this.applicationState.setCurrentUser(
        userId,
        session.id
    );
}

}
export class LoginService {
    constructor(
        private readonly repositories: SQLiteAuthRepository
    ){}


}