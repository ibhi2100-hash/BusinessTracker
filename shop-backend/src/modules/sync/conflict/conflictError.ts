export class AggregateVersionConflictError
    extends Error {

    constructor(
        public readonly aggregateId: string,
        public readonly aggregateType: string,
        public readonly expectedVersion: number
    ) {
        super(
            `Aggregate version conflict for ` +
            `${aggregateType}:${aggregateId}. ` +
            `Expected version ${expectedVersion}.`
        );

        this.name =
            "AggregateVersionConflictError";
    }
}