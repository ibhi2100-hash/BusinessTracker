

import { DatabaseInfo } from "../../database/databaseInformation";
import { BusinessSession } from "../../worker/sessions/BusinessStorageSession"

export class BusinessSessionManager {
    private session:
        BusinessSession | null = null;

    constructor(
        private readonly nodeId: string
    ) {
    }
    async open(
    ){

        if(

            this.session?.nodeId===this.nodeId

        ){

            return;

        }

        if(this.session){

            await this.session.dispose();

        }

        this.session =
            new BusinessSession(this.nodeId);

        await this.session.initialize();

    }
    private requireSession(): BusinessSession {

    if (!this.session) {

        throw new Error(
            "No Business Node is currently open."
        );

    }

    return this.session;

}
    async close() {

       if(!this.session) return;

       await this.session.dispose();

       this.session = null;
    }   
    query<T>(
        sql: string,
        params: unknown[] = []
    ) {

        return this
            .requireSession()
            .query<T>(
                sql,
                params
            )


    }   
    execute(
        sql: string,
        params: unknown[] = []
    ) {

        return this
            .requireSession()
            .execute(
                sql,
                params
            )

    }   
    scalar<T>(
        sql: string,
        params: unknown[] = []
    ) {

        return this
            .requireSession()
            .scalar<T>(
                sql,
                params
            )

    }   
    exists(
        sql: string,
        params: unknown[] = []
    ) {

        return this
            .requireSession()
            .exists(
                sql,
                params
            )

    }
    transaction<T>(
        callback: () => Promise<T>
    ) {

        return this
            .requireSession()
            .transaction(
                callback
            )

    }
    isOpen() {

        return this.session !== null;

    }

    isReady(): boolean {
        return this.session.isReady() ?? false
    }

    currentNode() {

        return this.session?.nodeId ?? null;

    }  

        async beginTransaction() {
        await this
            .requireSession()
            .beginTransaction()
    }

    async commitTransaction() {
        await this
            .requireSession()
            .commitTransaction();
    }

    async rollbackTransaction() {
        await this
            .requireSession()
            .rollbackTransaction()
    }

    async dispose(): Promise<void> {
        await this.close()
    }

    async vacuum(): Promise<void> {
        return this
            .requireSession()
            .vacuum()
    }

    async integrityCheck(): Promise<void> {
        return this
            .requireSession()
            .integrityCheck()
    }

    async databaseInfo(): Promise<DatabaseInfo> {
        return this
            .requireSession()
            .databaseInfo()
    }

}