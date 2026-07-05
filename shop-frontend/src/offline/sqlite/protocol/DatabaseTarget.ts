export const DatabaseTarget = {

    CLIENT: "client",

    BUSINESS: "business",

} as const;

export type DatabaseTarget =
    typeof DatabaseTarget[keyof typeof DatabaseTarget];