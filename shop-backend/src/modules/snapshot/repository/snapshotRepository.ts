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
        snapshotKey:
          snapshot.snapshotKey
      },

      // cast to any to satisfy Prisma's strict exactOptionalPropertyTypes checks
      create: snapshot as any,

      update: snapshot as any
    });
  }
}