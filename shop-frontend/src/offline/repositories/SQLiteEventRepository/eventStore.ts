// SQLiteEventRepository.ts
import { EventStatements } from "../../sqlite/prepareStatementManager/EventStatement"

export class SQLiteEventRepository{

  constructor(
    private readonly events:
    EventStatements
  ){}

  

}