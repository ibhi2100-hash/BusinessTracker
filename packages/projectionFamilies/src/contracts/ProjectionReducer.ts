export interface ProjectionReducer
<
    TState,
    TEvent
>{

    reduce(

        state: TState | null,

        event: TEvent

    ): TState;

}