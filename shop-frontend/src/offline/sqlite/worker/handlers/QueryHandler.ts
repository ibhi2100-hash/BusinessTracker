export async function QueryHandler(

    engine,

    payload

) {

    return engine.query(

        payload.sql,

        payload.params ?? []

    );

}