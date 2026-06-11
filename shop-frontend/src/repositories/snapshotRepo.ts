import { SnapshotRepo} from "@business/snapshot-engine"
import { Snapshot } from "@business/shared-types";
import { AppDB } from "../db";


export class IndexedDbSnapshotRepo
  implements SnapshotRepo {
    constructor(
        private db: AppDB
    ){}

  async get(key : string) {

    return this.db.snapshots.get(key);
  }

  async save(snapshot: Snapshot): Promise<void> {

    await this.db.snapshots.put(snapshot);
  }
  async delete(aggregateId: string): Promise<void> {
        await this.db.snapshots.delete(aggregateId)
  }
}