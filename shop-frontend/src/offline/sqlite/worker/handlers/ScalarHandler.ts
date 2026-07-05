export async function ScalarHandler(

    engine,

    payload

) {

    return engine.scalar(

        payload.sql,

        payload.params ?? []

    );

}