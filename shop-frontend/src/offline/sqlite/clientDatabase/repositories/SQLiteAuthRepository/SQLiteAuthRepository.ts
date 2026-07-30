// SQLiteBusinessRepository.ts

import { User } from "@business/shared-types";
import { UserStatements } from "../../statements/users/UserStatements";


export class SQLiteAuthRepository{
  constructor (
    private readonly users: UserStatements
  ){}

  async addUser(user: User): Promise<User> {
    await this.users.insert.execute(
        UserMapper.toInsert(user)
    );
    const rows = 
        await this.users.findById.query<User>([
            user.id
        ]);
    if(rows.length === 0){
        throw new Error(
            "User was inserted but could not be loaded"
        )
    };

    return rows[0]
}

    async findById(userId: string):Promise <User> {
        const rows = await this.users.findById.query<User>([
            userId
        ])

        return rows[0]
    }
}

export class UserMapper {

    static toInsert(
        user: User
    ): readonly unknown[] {

        return [
            user.id,
            user.businessId,
            user.branchId,
            user.name,
            user.email,
            user.role,
            user.onboardingCompleted,
            user.isActive,
            user.version,
            user.lastEventId,
            user.createdAt,
            user.updatedAt,
        ];
    }

}