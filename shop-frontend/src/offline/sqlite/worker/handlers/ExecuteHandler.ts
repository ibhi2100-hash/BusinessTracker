export async function ExecuteHandler(

    engine,

    payload

) {

    return engine.execute(

        payload.sql,

        payload.params ?? []

    );

}