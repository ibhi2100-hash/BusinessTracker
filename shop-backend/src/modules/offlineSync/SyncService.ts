export class SyncApplicationService {

    constructor(

        private eventStore: EventStore,

        private aggregateStates: AggregateStateRepository,

        private conflictDetector: ConflictDetector,

        private eventAppender: EventAppender,

        private responseBuilder: SyncResponseBuilder

    ) {}

    async execute(
        request: SyncRequest
    ): Promise<SyncResult> {

        //
    }

}