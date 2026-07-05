export interface CommandIntent<TPayload> {

    readonly type: string;

    readonly payload: Readonly<TPayload>;

}