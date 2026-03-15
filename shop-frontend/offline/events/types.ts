export interface Event {
    id: string;
    type: string;
    payload: any;
    timestamp: number;
    synced: boolean;
    status: "pending" | "synced" | "failed";
    businessId: string;
    branchId: string;
    
}