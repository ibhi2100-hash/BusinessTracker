export declare const reducers: {
    PRODUCT: {
        reduce(current: import("@business/shared-types").Product | null, event: import("@business/shared-types").BaseEvent): import("@business/shared-types").Product | null;
    };
    INVENTORY: {
        reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
    };
    BUSINESS: {
        reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
    };
    BRANCH: {
        reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
    };
    DASHBOARD: {
        reduce(current: any, event: import("@business/shared-types").BaseEvent): any;
    };
};
