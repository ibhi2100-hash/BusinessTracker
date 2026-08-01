import { logicClockKeys } from "./Keys"
import { StatementDefinition } from "../../../PreparedStatement/StatementRegistry/statementDefinition"
import * as SQL from "./sql"

export const LogicClockDefinition: StatementDefinition[]= [
    {
        key: logicClockKeys.getclock,
        sql: SQL.GET_CURRENT_LOGIC_CLOCK
    },

    {
        key: logicClockKeys.updateClock,
        sql: SQL.INCREMENT_CLOCK
    }

]