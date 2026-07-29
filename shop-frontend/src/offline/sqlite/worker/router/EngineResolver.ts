import { DatabaseTarget } from "../../protocol/DatabaseTarget";

import { BusinessSessionManager } from "../sessions/BusinessSessionManager";
import { ClientSessionManager } from "../sessions/ClientSessionManager";

const engines = new Map<DatabaseTarget, any>();

function getEngine(target: DatabaseTarget): any {
    if(engines.has(target)){
        return engines.get(target)
    }

    let engine: any;

    switch(target){
        case DatabaseTarget.CLIENT:
            engine = ClientSessionManager.getInstance();
            break;
        case DatabaseTarget.BUSINESS:
            engine = BusinessSessionManager.getInstance();
            break;
        default:
            throw new Error(`Unknown Database Target: ${target}`)
    }

    engines.set(target, engine);
    return engine;
}

export function resolveEngine(target: DatabaseTarget){
    const engine = getEngine(target);

    if(!engine){
        throw new Error(`Engine not available for '${target}'`);
    }

    return engine
}