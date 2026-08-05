export interface ProjectionReducer
<
    TEvent
>{

    reduce(
        event: TEvent
    ): any

}