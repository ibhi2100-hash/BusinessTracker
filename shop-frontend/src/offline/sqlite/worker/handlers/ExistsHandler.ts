export async function ExistHandler(

    engine,

    payload

) {

    return engine.exist(

        payload.sql,

        payload.params ?? []

    );

}