

import { BusinessSession } from "@/src/BizTru_Karnel/contracts/SubKernelContracts";
import { DatabaseInfo } from "../../database/databaseInformation";
import { BusinessStorageSession} from "../../worker/sessions/BusinessStorageSession"

export class BusinessSessionManager {
    private session:
        BusinessStorageSession | null = null;

    private currentNodeId: string | null = null
    async openNode(nodeId: string):
        Promise<BusinessSession>{

        if(

            this.session?.nodeId===nodeId

        ){

            return this.session

        }

        if(this.session){

            await this.session.dispose();

        }

        this.session =
            new BusinessStorageSession(nodeId);

        await this.session.initialize();

        return this.session

    }
    private requireSession(): BusinessStorageSession {

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

    async databaseInfo(): Promise<DatabaseInfo> {
        return this
            .requireSession()
            .databaseInfo()
    }

}