import { PreparedStatement } from "../../../PreparedStatement/PreparedStatementContract";
import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { businessKeys } from "./businessKeys";

export class BusinessStatements {
   
    constructor(
      private readonly   manager: PreparedStatementManager
    ){}

    get upsert(){
        return this.manager.get(
            businessKeys.businessUpsert
        )
    }

    get findById(){
        return this.manager.get(
            businessKeys.findById
        )
    }

    get delete(){
        return this.manager.get(
            businessKeys.businessDelete
        )
    }

    get update(){
        return this.manager.get(
            businessKeys.businesssUpdate
        )
    }
}