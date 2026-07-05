import { IStorageContext } from "../types/IStorageContext";

export class TransactionManager {

    constructor(
        private readonly context: IStorageContext
    ) {}    

    async begin() {

    const db =
        this.context
            .connectionManager
            .isOpen() ? this.context.database : null;

    db.exec(
        "BEGIN IMMEDIATE"
    );

}
    async commit() {

    const db =
        this.context
            .connectionManager
            .isOpen() ? this.context.database : null;

    db.exec(
        "COMMIT"
    );

}
    async rollback() {

    const db =
        this.context
            .connectionManager
            .isOpen() ? this.context.database : null;

    db.exec(
        "ROLLBACK"
    );

}
    async transaction<T>(
    callback: () => Promise<T>
): Promise<T> {
    if (this.inTransaction) {
    throw new Error("Transaction already active.");
}

this.inTransaction = true;

    await this.begin();

    try {

        const result =
            await callback();

        await this.commit();

        return result;

        

    } catch (error) {

        await this.rollback();

        throw error;

    }finally{
        this.inTransaction = false;
    }

}
    inTransaction = false;
}