import { ClientDatabase } from "./ClientStorageEngine";
import { ClientMigrationRunner } from "./ClientMigrationRunner"

export async function initializeClientStorage() {

    const db =
        ClientDatabase.getInstance();

    await db.initialize();

    const migrations =
        new ClientMigrationRunner(

            db.connection

        );

    await migrations.run();

}