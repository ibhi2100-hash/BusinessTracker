export type EventScope = "GLOBAL" | "BUSINESS" | "BRANCH";  

export interface Events {
    id: string;

    type: string;
    payload: any;

    branchId: string;
    businessId: string;

    mode: "OPENING" | "LIVE"

    // sync + ordering 

    createdAt: Date;
    logicClock: number;
    version: number;

    //origin
    deviceId: string;
    userId: string;

    //sync state

    status: "pending" | "synced" | "failed";
    synced: boolean;
    
    
}