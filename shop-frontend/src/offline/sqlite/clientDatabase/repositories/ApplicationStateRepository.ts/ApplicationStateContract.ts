import { ApplicationState } from "./ApplicationState"
export interface ApplicationStateRepository {

    current(): Promise<ApplicationState>;

    setCurrentBusiness(
        businessId: string
    ): Promise<void>;

    setCurrentBranch(
        branchId: string | null
    ): Promise<void>;

    setCurrentUser(
        userId: string,
        sessionId: string
    ): Promise<void>;

    clearSession(): Promise<void>;
}