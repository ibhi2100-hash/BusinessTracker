import { StorageBus } from "../../sqlite/bus/StorageBus";
import { DatabaseTarget } from "../../sqlite/protocol/DatabaseTarget";
import { Session } from "./SessionInterface";

export class SessionStatements {

    constructor(
        private readonly storage: StorageBus
    ) {}

    async saveSession(session: Session): Promise<void> {
        return await this.storage.execute(

            DatabaseTarget.CLIENT,

                `
            INSERT INTO sessions (

                id,
                userId,
                accessToken,
                refreshToken,
                expiresAt,
                createdAt

            )
            VALUES (

                ?,
                ?,
                ?,
                ?,
                ?,
                ?

            );
        `,

        [

           session.id,
           session.userId,
           session.accessToken,
           session.refreshToken,
           session.expiresAt,
           session.createdAt,
            ]    

            );

    }

    async getCurrentSession(): Promise<Session | undefined> {

        const rows = await this.storage.query<Session>(

            DatabaseTarget.CLIENT,

            `
        SELECT *

        FROM sessions
    `
        );

        const row = rows[0];

        if (!row) {
            return undefined;
        }

        return row;
    }

    async clearSession(){
        return await this.storage.execute(
            DatabaseTarget.CLIENT,
            `
                DELETE FROM sessions
            `
        )
    }


}