import { PreparedStatementContract } from "./PreparedStatementContract";

export class SQLitePreparedStatement
implements PreparedStatementContract {
    constructor(
        private readonly stmt: any
    ){}


}