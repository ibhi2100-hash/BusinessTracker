import { GET_CURRENT_CONTEXT } from "./sql";
import { ExecutionContextKeys as Keys } from "./Keys";
export const ExecutionContextDefinitions = [

    {
        key: Keys.curentContext,
        sql: GET_CURRENT_CONTEXT
    }

];