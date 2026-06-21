import { SnapshotMetadata } from "./SnapshotMetadata";

export interface SnapshotMetadataRepo {
  get(aggregateKey: string): Promise<SnapshotMetadata>;
}