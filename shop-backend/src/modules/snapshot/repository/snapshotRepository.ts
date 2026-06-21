import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { SnapshotRepo} from "@business/snapshot-engine"

import { Snapshot } from "@business/shared-types"
export class PrismaSnapshotRepo implements SnapshotRepo {
    constructor(
        private tx: Prisma.TransactionClient
    ){}
  async delete(aggregateId: string): Promise<void> {
    await this.tx.snapshot.delete({
      where: {
        snapshotKey: aggregateId
      }
    });
  }
  async get(
    aggregateId: string
  ): Promise<Snapshot<any> | null> {

    const snapshot = await this.tx.snapshot.findUnique({
      where: {
        snapshotKey: aggregateId
      }
    });

    return snapshot as Snapshot<any> | null;
  }

  async save(
    snapshot: Snapshot
  ): Promise<void> {

    await this.tx.snapshot.upsert({
  where: {
    snapshotKey: snapshot.snapshotKey,
  },

  create: {
    id: snapshot.id,

    snapshotKey: snapshot.snapshotKey,
    snapshotType: snapshot.snapshotType,
    scope: snapshot.scope,

    businessId: snapshot.businessId!, // see below

    branchId: snapshot.branchId ?? null,
    branchBusinessId: snapshot.businessId ?? null,

    aggregateId: snapshot.aggregateId ?? null,
    aggregateType: snapshot.aggregateType ?? null,

    version: snapshot.version,

    data: snapshot.state,

    lastGlobalPosition: snapshot.lastGlobalPosition,

    checksum: snapshot.checksum ?? null,

    eventCount: snapshot.eventCount,
  },

  update: {
    version: snapshot.version,
    eventCount: snapshot.eventCount,
    lastGlobalPosition: snapshot.lastGlobalPosition,

    checksum: snapshot.checksum ?? null,

    data: snapshot.state,
  },
});
  }
}