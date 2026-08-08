export interface ProjectionReducer
<   
    TState,
    TEvent
>{

    reduce(
        state: TState,
        event: TEvent
    ): TState

}