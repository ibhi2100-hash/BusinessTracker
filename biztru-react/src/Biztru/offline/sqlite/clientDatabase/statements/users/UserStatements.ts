import type {
    PreparedStatement
} from "../../../PreparedStatement/PreparedStatementContract";

import type {
    PreparedStatementManager
} from "../../../PreparedStatement/PreparedStatementManager";

import {
    UserStatementKeys
} from "./keys";


export class UserStatements {

    readonly insert: PreparedStatement;

    readonly findById: PreparedStatement;

    readonly updateUser: PreparedStatement;

    readonly updateBusiness: PreparedStatement;

    readonly updateBranch: PreparedStatement;

    readonly updateActivation: PreparedStatement;

    readonly updateOnboarding: PreparedStatement;

    readonly updateProfile: PreparedStatement;

    readonly delete: PreparedStatement;


    constructor(
        manager: PreparedStatementManager
    ) {

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


        this.updateBusiness =
            manager.get(
                UserStatementKeys.updateBusiness
            );


        this.updateBranch =
            manager.get(
                UserStatementKeys.updateBranch
            );


        this.updateActivation =
            manager.get(
                UserStatementKeys.updateActivation
            );


        this.updateOnboarding =
            manager.get(
                UserStatementKeys.updateOnboarding
            );


        this.updateProfile =
            manager.get(
                UserStatementKeys.updateProfile
            );


        this.delete =
            manager.get(
                UserStatementKeys.delete
            );

    }

}