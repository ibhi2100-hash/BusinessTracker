import { BusinessEventTypes, InventoryEventType, OpeningEventType, salesEventType } from "@business/shared-types";
export declare const projectorRegistry: {
    [InventoryEventType.PRODUCT_CREATED]: {
        reducer: {
            reduce(current: import("@business/shared-types").Product | null, event: import("@business/shared-types").BaseEvent): import("@business/shared-types").Product | null;
        };
        target: string;
    }[];
    [InventoryEventType.PRODUCT_UPDATED]: {
        reducer: {
            reduce(current: import("@business/shared-types").Product | null, event: import("@business/shared-types").BaseEvent): import("@business/shared-types").Product | null;
        };
        target: string;
    }[];
    [InventoryEventType.PRODUCT_DELETED]: {
        reducer: {
            reduce(current: import("@business/shared-types").Product | null, event: import("@business/shared-types").BaseEvent): import("@business/shared-types").Product | null;
        };
        target: string;
    }[];
    [OpeningEventType.OPENING_INVENTORY_CREATED]: {
        reducer: {
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        target: string;
    }[];
    [InventoryEventType.INVENTORY_ADDED]: {
        reducer: {
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        target: string;
    }[];
    [BusinessEventTypes.BUSINESS_CREATED]: {
        reducer: {
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        target: string;
    }[];
    [BusinessEventTypes.BUSINESS_ACTIVATION]: {
        reducer: {
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        target: string;
    }[];
    [salesEventType.SALE_ADDED]: {
        reducer: {
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        target: string;
    }[];
    [BusinessEventTypes.BRANCH_CREATED]: {
        reducer: {
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        target: string;
    }[];
    [BusinessEventTypes.BRANCH_SWITCH]: {
        reducer: {
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        target: string;
    }[];
};
