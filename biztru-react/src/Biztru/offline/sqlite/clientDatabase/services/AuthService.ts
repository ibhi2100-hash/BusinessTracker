
import type{ User } from "@business/shared-types";
import { SQLiteSessionRepository } from "../repositories/SQLiteSessionRepository/SQLiteSessionRepository";
import { SQLiteAuthRepository } from "../repositories/SQLiteAuthRepository/SQLiteAuthRepository";
import { SQLiteApplicationStateRepository } from "../repositories/ApplicationStateRepository.ts/SQLiteApplicationStateRepository";
import type { CurrentSessionRepository } from "../repositories/currentSessionRepository/currentSessionRepository";


interface RegisterResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}
export class RegistrationService {
    private readonly repository: SQLiteAuthRepository;
    private readonly session: SQLiteSessionRepository;
    private readonly applicationState: SQLiteApplicationStateRepository;
    private readonly currentSessionRepository: CurrentSessionRepository;
    constructor(

        repository: SQLiteAuthRepository,
        session: SQLiteSessionRepository,
        applicationState: SQLiteApplicationStateRepository,
        currentSessionRepository: CurrentSessionRepository

    ) {
        this.repository = repository;
        this.session = session;
        this.applicationState = applicationState;
        this.currentSessionRepository = currentSessionRepository;
    }

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

        await this.currentSessionRepository.save({
            id: 1,
            userId: user.id,
            createdAt: Date.now(),
            lastAuthenticatedAt: Date.now(),
            updatedAt: null
        })
        
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