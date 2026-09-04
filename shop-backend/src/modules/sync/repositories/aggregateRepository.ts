import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class AggregateRepository {
    async getAggregateVersion(
        aggregateId: string,
        aggregateType: string,
    ): Promise<number | null> {
        const aggregateRow = await prisma.aggregate.findFirst({
            where: {
                aggregateId: aggregateId,
                aggregateType: aggregateType
            }
        })

        const aggregateVersion = aggregateRow?.version;

        return aggregateVersion ?? 0
    }
}