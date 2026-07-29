import { BusinessStorageSession } from "./BusinessStorageSession";
export interface BusinessSession {

    createBusiness(
        nodeId: string
    ): Promise<BusinessStorageSession>;

    getSession(
        nodeId: string
    ): Promise<BusinessStorageSession>;
}