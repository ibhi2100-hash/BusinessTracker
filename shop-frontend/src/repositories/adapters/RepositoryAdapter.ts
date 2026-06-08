import { SnapshotRepo } from "@business/snapshot-engine";
import { AppDB } from "@/src/db";

export class DexieSnapshotRepo
  implements SnapshotRepo {

  constructor(
    private db: AppDB
  ) {}

  async get(key: string) {

    return this.db.snapshots.get(key);
  }

  async save(snapshot) {

    await this.db.snapshots.put(snapshot);
  }

  async delete(){

  }
}