// SQLiteBusinessRepository.ts

import { User } from "@business/shared-types";
import { DatabaseTarget } from "../../sqlite/protocol/DatabaseTarget";
import { UserStatements } from "./UserStatements";

export class SQLiteAuthRepository{
  constructor (
    private readonly users: UserStatements
  ){}

  async addUser(user: User): Promise<User> {

      
   const result =  await this.users.insert(user)
   console.log("User: ", result)
    const userById =await this.users.findById(user.id) 

    console.log("User: ", userById)

    

    return user 

}
}