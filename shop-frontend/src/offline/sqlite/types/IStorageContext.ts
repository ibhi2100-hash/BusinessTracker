export interface IStorageContext {
    readonly database: any;
    readonly connectionManager: {
    isOpen(): boolean;
    };
}