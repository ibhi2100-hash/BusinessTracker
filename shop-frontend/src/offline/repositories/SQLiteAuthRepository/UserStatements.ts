import { User } from "@business/shared-types";
import { DatabaseTarget } from "../../sqlite/protocol/DatabaseTarget";
import { StorageBus } from "../../sqlite/bus/StorageBus";

export class UserStatements {

    constructor(
        private readonly storage: StorageBus
    ) {}

    insert(user: User) {
        return this.storage.execute(

            DatabaseTarget.CLIENT,

                `
            INSERT INTO users (

                id,
                businessId,
                branchId,
                name,
                email,
                role,
                onboardingCompleted,
                isActive,
                version,
                lastEventId,
                createdAt,
                updatedAt

            )
            VALUES (

                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?

            );
        `,

        [

                user.id,
                user.businessId,
                user.branchId,
                user.name,
                user.email,
                user.role,

                user.onboardingCompleted ? 1 : 0,
                user.isActive ? 1 : 0,

                user.version,
                user.lastEventId,

                user.createdAt.toISOString()  ?? null,
                user.updatedAt
                

            ]    

            );

    }

    findById(id: string) {

        return this.storage.query<User>(

            DatabaseTarget.CLIENT,

            `
        SELECT *

        FROM users
        
        WHERE id = ?
    `,
    [id]
        );

    }


}