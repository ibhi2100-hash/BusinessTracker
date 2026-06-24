import { DatabaseDriver } from "./types/databaseDriver";

export class Transaction {

    constructor(
        private db: DatabaseDriver
    ) {}

    async run<T>(
        callback: () => Promise<T>
    ): Promise<T> {

        return this.db.transaction(callback);

    }

}