import { PreparedStatement } from "../../../PreparedStatement/PreparedStatementContract";
import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { businessKeys } from "./businessKeys";

export class BusinessStatements {
    readonly upsertBusiness: PreparedStatement;
    readonly findById: PreparedStatement;
    readonly deleteBusiness: PreparedStatement;
    readonly update: PreparedStatement;
    constructor(
        manager: PreparedStatementManager
    ){
        this.upsertBusiness = 
            manager.get(
                businessKeys.businessUpsert
            );
        this.findById = 
            manager.get(
                businessKeys.findById
            )

        this.deleteBusiness = 
            manager.get(
                businessKeys.businessDelete
            )

        this.update =
            manager.get(
                businessKeys.businesssUpdate
            )
    }
}