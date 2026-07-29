// SQLiteBusinessRepository.ts

import { User } from "@business/shared-types";
import { UserStatements } from "../../statements/users/UserStatements";
import { use } from "react";


export class SQLiteAuthRepository{
  constructor (
    private readonly users: UserStatements
  ){}

  async addUser(user: User): Promise<User> {
    const databaseUser = UserMapper.toInsert(user);
    const result =  await this.users.insert.execute
    const userById = await this.users.findById.execute(databaseUser);

    return userById[1]

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