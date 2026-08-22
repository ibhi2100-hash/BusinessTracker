import { AggregateRecord } from "@/offline/domain/aggregate";
import { AggregateStatements } from "../../statements/aggregates/aggregateStatements";

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
        aggregateType,
        aggregateId,
        expectedAggregateVersion,
        eventId,
        updatedAt
       ]) 
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