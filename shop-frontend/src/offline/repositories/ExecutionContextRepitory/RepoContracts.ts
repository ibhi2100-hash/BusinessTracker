
export interface ExecutionContextRecord {

    userId: string;

    businessId: string;

    branchId: string;

    deviceId: string;

    sessionId: string;

    logicalClock: number;

}
export interface ExecutionContextRepositoryContract {

    getCurrentContext(): Promise<ExecutionContextRecord>;

}