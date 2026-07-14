import { SQLitePreparedStatement } from "./PreparedStatement";
import { PreparedStatementContract} from "./PreparedStatementContract"

export class PreparedStatementManager {

    constructor(
        private readonly context: IStorageContext,
        private readonly sql: string,
        private cache =
            new Map<string, SQLitePreparedStatement>(),
    ){}
    async prepare(sql){
        
    }
    
    statement(id: string, sql){

    }
    clear(){
        
    }

}