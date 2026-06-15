import { InventoryEventType, OpeningEventType, salesEventType, BusinessEventTypes } from "@business/shared-types";
export declare const operationalRegistry: {
    [InventoryEventType.PRODUCT_CREATED]: {
        reducer: {
            initialState: () => {
                id: string;
                businessId: string;
                branchId: string;
                name: string;
                imageUrl: string;
                description: string;
                costPrice: number;
                price: number;
                isDeleted: boolean;
            };
            reduce(current: import("@business/shared-types").Product | null, event: import("@business/shared-types").BaseEvent): import("@business/shared-types").Product | null;
        };
        projection: string;
    }[];
    [InventoryEventType.PRODUCT_UPDATED]: {
        reducer: {
            initialState: () => {
                id: string;
                businessId: string;
                branchId: string;
                name: string;
                imageUrl: string;
                description: string;
                costPrice: number;
                price: number;
                isDeleted: boolean;
            };
            reduce(current: import("@business/shared-types").Product | null, event: import("@business/shared-types").BaseEvent): import("@business/shared-types").Product | null;
        };
        projection: string;
    }[];
    [InventoryEventType.PRODUCT_DELETED]: {
        reducer: {
            initialState: () => {
                id: string;
                businessId: string;
                branchId: string;
                name: string;
                imageUrl: string;
                description: string;
                costPrice: number;
                price: number;
                isDeleted: boolean;
            };
            reduce(current: import("@business/shared-types").Product | null, event: import("@business/shared-types").BaseEvent): import("@business/shared-types").Product | null;
        };
        projection: string;
    }[];
    [OpeningEventType.OPENING_INVENTORY_CREATED]: {
        reducer: {
            initialState: () => {
                id: string;
                productId: string;
                branchId: string;
                businessId: string;
                quantity: number;
                costPrice: number;
            };
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        projection: string;
    }[];
    [InventoryEventType.INVENTORY_ADDED]: {
        reducer: {
            initialState: () => {
                id: string;
                productId: string;
                branchId: string;
                businessId: string;
                quantity: number;
                costPrice: number;
            };
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        projection: string;
    }[];
    [InventoryEventType.INVENTORY_SOLD]: {
        reducer: {
            initialState: () => {
                id: string;
                productId: string;
                branchId: string;
                businessId: string;
                quantity: number;
                costPrice: number;
            };
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        projection: string;
    }[];
    [InventoryEventType.INVENTORY_ADJUSTED]: {
        reducer: {
            initialState: () => {
                id: string;
                productId: string;
                branchId: string;
                businessId: string;
                quantity: number;
                costPrice: number;
            };
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        projection: string;
    }[];
    [salesEventType.SALE_ADDED]: {
        reducer: {
            initialState: () => {
                id: string;
                productId: string;
                price: number;
                costPrice: number;
                quantity: number;
                total: number;
            };
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        projection: string;
    }[];
    [BusinessEventTypes.BUSINESS_CREATED]: {
        reducer: {
            initialState: () => {
                id: string;
                name: string;
                userId: string;
                address: string;
            };
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        projection: string;
    }[];
    [BusinessEventTypes.BUSINESS_ACTIVATION]: {
        reducer: {
            initialState: () => {
                id: string;
                name: string;
                userId: string;
                address: string;
            };
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        projection: string;
    }[];
    [BusinessEventTypes.BRANCH_CREATED]: {
        reducer: {
            initialState: () => {
                id: string;
                name: string;
                address: string;
                phone: string;
            };
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        projection: string;
    }[];
    [BusinessEventTypes.BRANCH_SWITCH]: {
        reducer: {
            initialState: () => {
                id: string;
                name: string;
                address: string;
                phone: string;
            };
            reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
        };
        projection: string;
    }[];
};
