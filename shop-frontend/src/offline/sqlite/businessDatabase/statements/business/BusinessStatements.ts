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

    get findAll(){
        return this.manager.get(
            businessKeys.findAll
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

    get activate(){
        return this.manager.get(
            businessKeys.businessActivation
        )
    }
}