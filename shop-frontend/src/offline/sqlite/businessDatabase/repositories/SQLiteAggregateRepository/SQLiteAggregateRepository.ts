import { AggregateRecord } from "@/offline/domain/aggregate";
import { AggregateStatements } from "../../statements/aggregates/aggregateStatements";
import { SQLiteStatementOperation } from "@/src/storage/statement/worker/WorkerProtocol";
import { aggregateStatementsKeys } from "../../statements/aggregates/aggregateStatementsKeys";

interface AggregateVersion {
    localVersion: number;
    version: number
}
export class SQLiteAggregateRepository {
    constructor(
        private readonly statements: AggregateStatements
    ){}

    async insertAggregates(aggregateData: AggregateRecord){
        await this.statements.insert.execute(AggregateMapper.toRow(aggregateData))
    }



  /**
   * Builds the database operation required to commit a local aggregate event.
   *
   * IMPORTANT:
   * - Does not execute anything.
   * - Does not perform another database read.
   * - Does not notify observers.
   * - The returned operation is executed inside the same SQLite transaction
   *   as the event insert and outbox insert.
   */
    commitAggregateOperation(
        aggregateType: string,
        aggregateId: string,
        expectedVersion: number,
        eventId: string,
        updatedAt: number,
        existing: AggregateVersion
    ): SQLiteStatementOperation {
        // First local event for this aggregate.
        if (
        existing.localVersion === 0 &&
        expectedVersion === 0
        ) {
        return {
            statementKey: aggregateStatementsKeys.insert,
            params: [
            crypto.randomUUID(),
            aggregateId,
            aggregateType,
            1, // localVersion
            0, // serverVersion
            eventId,
            null, // serverEventId
            null, // serverUpdatedAt
            0, // pending/whatever your actual column represents
            updatedAt,
            ],
        };
        }

        /*
        * The caller calculated expectedVersion from the version read before
        * entering the transaction.
        *
        * This protects the application-level expectation, while the SQL
        * UPDATE itself must ALSO contain localVersion = expectedVersion
        * in its WHERE clause so the database enforces the concurrency rule.
        */
        if (existing.localVersion !== expectedVersion) {
        throw new Error(
            `Aggregate version conflict for ${aggregateType}:${aggregateId}. ` +
            `Expected local version ${expectedVersion}, ` +
            `but current local version is ${existing.localVersion}.`
        );
        }

        return {
        statementKey: aggregateStatementsKeys.advanceLocal,
        params: [
            eventId,
            updatedAt,
            aggregateType,
            aggregateId,
            expectedVersion,
        ],
        };
    }

    async getAggregate(
        aggregateType: string,
        aggregateId: string
    ): Promise<AggregateRecord | null>{
        const rows = await this.statements.getAggregate.query<AggregateRecord>([aggregateType,aggregateId]);
        const aggregate = rows[0]

        return aggregate;
    }

    async getVersion(
        aggregateId: string,
        aggregateType: string
    ): Promise<AggregateVersion | null>{
        const rows = await this.statements.getVersion.query<AggregateVersion>([aggregateType,aggregateId]);

        const versions = rows[0];

        return versions ?? {localVersion: 0, version: 0}
    } 

    async advanceLocal(
        aggregateType: string,
        aggregateId: string,
        expectedAggregateVersion: number,
        eventId: string,
        updatedAt: number
    ){
       await this.statements.advanceLocal.execute([
            eventId,                  // ?
            updatedAt,                // ?
            aggregateType,            // ?
            aggregateId,              // ?
            expectedAggregateVersion  // ?
        ]);
    }


    async commitLocalEvent(
        aggregateType: string,
        aggregateId: string,
        expectedVersion: number,
        eventId: string,
        updatedAt: number
    ): Promise<number> {

        const existing =
            await this.getVersion(
                aggregateId,
                  aggregateType
            );

        /*
         * First event for this aggregate.
         */
        if (
            existing.localVersion === 0 &&
            expectedVersion === 0
        ) {
            await this.statements.insert.execute([
                crypto.randomUUID(),
                aggregateId,
                aggregateType,
                1,
                0,
                eventId,
                null,
                null,
                0,
                updatedAt
            ]);

            return 1;
        }

        /*
         * Existing aggregate.
         */
        if (
            existing.localVersion !== expectedVersion
        ) {
            throw new Error(
                `Aggregate version conflict: ` +
                `${aggregateType}/${aggregateId}. ` +
                `Expected ${expectedVersion}, ` +
                `actual ${existing.localVersion}`
            );
        }

        await this.statements.advanceLocal.execute([
            eventId,
            updatedAt,
            aggregateType,
            aggregateId,
            expectedVersion
        ]);

        return expectedVersion + 1;
    }

    async getAllAggregate(): Promise<AggregateRecord[]> {
        const aggregates = await this.statements.getAllAggregate.query<AggregateRecord>();
        return aggregates
    }
}

class AggregateMapper {
    static toRow(
        aggregate: AggregateRecord
    ): unknown[]{
        return [
            aggregate.id,
            aggregate.aggregateId,
            aggregate.aggregateType,
            aggregate.localVersion,
            aggregate.version ?? 0,
            aggregate.lastEventId,
            aggregate.lastGlobalPosition,
            aggregate.lastSnapshotVersion,
            aggregate.isDeleted,
            aggregate.updatedAt
        ]
    }
}