export async function RollbackTransactionHandler(

    engine,

    payload

) {

    return engine.query(

        payload.sql,

        payload.params ?? []

    );

}