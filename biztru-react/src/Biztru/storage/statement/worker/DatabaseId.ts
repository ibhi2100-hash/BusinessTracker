export type DatabaseId =
    | {
        type: "client";
    }
    | {
        type: "business";
        businessId: string;
    };

export function databaseIdToKey(
    id: DatabaseId
): string {

    if (id.type === "client") {
        return "client";
    }

    return `business:${id.businessId}`;
}