import type{ PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { BranchStatementKeys } from "./BranchStatementKeys";

export class BranchStatements {
    private readonly manager: PreparedStatementManager;
    constructor(
        manager: PreparedStatementManager
    ){
        this.manager = manager
    }

    get insert(){
        return this.manager.get(BranchStatementKeys.insert);
    }

    get findAll(){
        return this.manager.get(BranchStatementKeys.findAll);
    }

    get findById(){
        return this.manager.get(BranchStatementKeys.findById)
    }

    get delete(){
        return this.manager.get(BranchStatementKeys.delete)
    }
}