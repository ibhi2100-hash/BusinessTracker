import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration017: Migration = {

    version: 17,

    name: "SyncState",

    async up(q) {

        /*
         * ---------------------------------------------------------
         * Remove any previous development version of sync_state.
         * ---------------------------------------------------------
         *
         * The synchronization cursor is only a checkpoint.
         *
         * If an old schema exists, we intentionally discard it and
         * start synchronization from cursor 0.
         */

        await q.execute(`
            DROP TABLE IF EXISTS sync_state;
        `);


        /*
         * ---------------------------------------------------------
         * Create canonical synchronization state.
         * ---------------------------------------------------------
         */

        await q.execute(`
            CREATE TABLE sync_state (

                stream TEXT PRIMARY KEY,

                cursor INTEGER NOT NULL DEFAULT 0,

                updatedAt INTEGER NOT NULL

            );
        `);


        /*
         * ---------------------------------------------------------
         * Create initial BUSINESS stream checkpoint.
         * ---------------------------------------------------------
         */

        await q.execute(`
            INSERT INTO sync_state (
                stream,
                cursor,
                updatedAt
            )
            VALUES (
                'BUSINESS',
                0,
                ${Date.now()}
            );
        `);
    }
};