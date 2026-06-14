export declare class Scheduler {
    private sync;
    private interval;
    private timer?;
    constructor(sync: () => Promise<void>, interval?: number);
    start(): void;
    stop(): void;
}
