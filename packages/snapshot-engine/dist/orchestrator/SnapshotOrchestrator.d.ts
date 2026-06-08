export declare class SnapshotOrchestrator {
    private registry;
    constructor(registry: SnapshotRegistry);
    process(db: any, event: any, ledgerEntries: any): Promise<void>;
}
