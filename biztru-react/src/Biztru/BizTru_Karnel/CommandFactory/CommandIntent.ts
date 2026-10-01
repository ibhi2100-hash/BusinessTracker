export interface CommandIntent<TPayload> {

    readonly type: string;

    readonly aggregateId: string;

    readonly aggregateType: string;

    readonly mode: "OPENING" | "LIVE"

    readonly payload: Readonly<TPayload>;

}