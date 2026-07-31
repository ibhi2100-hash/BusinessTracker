import { BusinessDomain } from "@/src/offline/sqlite/businessDatabase/domain/BusinessDomain";
import { BusinessStorage } from "@/src/offline/sqlite/businessDatabase/storage/BusinessStorage";
import { BusinessSynchronization } from "@/src/offline/sqlite/businessDatabase/synchronization/BusinessSynchronization";


export interface BusinessApplicationContract
 {
    readonly businessId: string;

    readonly storage: BusinessStorage;

    readonly domain: BusinessDomain;

    readonly synchronization: BusinessSynchronization
}