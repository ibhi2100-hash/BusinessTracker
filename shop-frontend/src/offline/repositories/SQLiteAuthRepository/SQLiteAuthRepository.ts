// SQLiteBusinessRepository.ts

import { User } from "@business/shared-types";
import { EventStatements } from "../../sqlite/prepareStatementManager/EventStatement";

export class SQLiteAuthRepository{
  constructor (
    private readonly sql:
    EventStatements
  ){}

  async addUser(userData: any):Promise<User> {
    const user = await this.sql.insert.execute() as User

    return user
  }
}