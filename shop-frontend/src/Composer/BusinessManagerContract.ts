import { Business } from "@business/shared-types";
import { BusinessApplication } from "./BusinessApplicationComposer";

export interface BusinessManagerContract {

    bootstrap(
        business: Business
    ): Promise<BusinessApplication>;

    open(
        businessId: string
    ): Promise<BusinessApplication>;

    get(
        businessId: string
    ): BusinessApplication | undefined;

    current():
        BusinessApplication | undefined;

    switch(
        businessId: string
    ): Promise<BusinessApplication>;

    close(
        businessId: string
    ): Promise<void>;

    dispose(): Promise<void>;

}