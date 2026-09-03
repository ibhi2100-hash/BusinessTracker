import {
    PreparedStatementManager
} from "../../../PreparedStatement/PreparedStatementManager";

import {
    syncStateKeys
} from "./syncStateKeys";


export class SyncStateStatements {

    constructor(
        private readonly manager:
            PreparedStatementManager
    ) {}


    get getCursor() {

        return this.manager.get(
            syncStateKeys.getCursor
        );
    }


    get setCursor() {

        return this.manager.get(
            syncStateKeys.setCursor
        );
    }


    get advanceCursor() {

        return this.manager.get(
            syncStateKeys.advanceCursor
        );
    }

}