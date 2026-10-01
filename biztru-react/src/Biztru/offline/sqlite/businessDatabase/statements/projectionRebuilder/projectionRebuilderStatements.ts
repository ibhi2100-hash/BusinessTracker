import type { PreparedStatement } from "../../../PreparedStatement/PreparedStatementContract";
import type{ PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";

import {
    ProjectionResetStatementKeys,
} from "./projectionRebuilderKeys";


export class  projectionResetStatements {
     constructor(
        private readonly manager: PreparedStatementManager
      ) {}

      
    
}