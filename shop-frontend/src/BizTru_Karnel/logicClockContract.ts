export interface BusinessClock {

    current(): Promise<number>;

    next(): Promise<number>;

}