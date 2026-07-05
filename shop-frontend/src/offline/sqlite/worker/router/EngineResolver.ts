import { DatabaseTarget } from "../../protocol/DatabaseTarget";

import { BusinessSessionManager } from "../../businessDatabase/engine/StorageEngine";
import { ClientSessionManager } from "../../clientDatabase/ClientStorageEngine";


const engines = {

    [DatabaseTarget.BUSINESS]: BusinessSessionManager,

    [DatabaseTarget.CLIENT]: ClientSessionManager,

} as const;

export function resolveEngine(
    target: DatabaseTarget
) {

    const engine = engines[target];

    if (!engine) {

        throw new Error(
            `Unknown database '${target}'.`
        );

    }

    return engine;

}