export async function BeginTransactionHandler(

    engine,

    payload

) {

    return engine.beginTransaction();

}