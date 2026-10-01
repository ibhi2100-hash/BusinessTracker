export interface CommandIdProvider {

    next(): Promise<string>;

}