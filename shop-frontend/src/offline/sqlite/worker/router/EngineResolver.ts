import { DatabaseTarget } from "../../protocol/DatabaseTarget";

import { BusinessSessionManager } from "../sessions/BusinessSessionManager";
import { ClientSessionManager } from "../sessions/ClientSessionManager";

const clientEngine =
    // ClientSessionManager uses a private constructor; obtain the shared instance
    // via its public static accessor.
    (ClientSessionManager as any).getInstance();

const businessEngine =
    new BusinessSessionManager()

const engines = {

    [DatabaseTarget.CLIENT]: clientEngine,

    [DatabaseTarget.BUSINESS]: businessEngine,

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