import type{ PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";


export class  projectionResetStatements {
    readonly manager: PreparedStatementManager
     constructor(
        manager: PreparedStatementManager
      ) {
        this.manager = manager
      }

      
    
}