import { ClientSessionManagerContract } from "../sessions/ClientSessionManagerContracts";

export async function ExecuteHandler(

    engine: ClientSessionManagerContract,

    payload

) {

    return engine.execute(

        payload.sql,

        payload.params ?? []

    );

}