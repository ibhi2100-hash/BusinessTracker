import { PreparedStatement } from "../../../PreparedStatement/PreparedStatementContract";
import { PreparedStatementManager } from "../../../PreparedStatement/PreparedStatementManager";
import { UserStatementKeys } from "./keys";


export class UserStatements {

    readonly insert: PreparedStatement;

    readonly findById: PreparedStatement;

    readonly updateUser: PreparedStatement;

    readonly delete: PreparedStatement;

    constructor(
        manager: PreparedStatementManager
    ){

        this.insert =
            manager.get(
                UserStatementKeys.insert
            );

        this.findById =
            manager.get(
                UserStatementKeys.findById
            );

        this.updateUser =
            manager.get(
                UserStatementKeys.update
            );

        this.delete =
            manager.get(
                UserStatementKeys.delete
            );

    }

}