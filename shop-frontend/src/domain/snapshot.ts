type SnapshotMeta = {
  id: string;

  businessId: string;
  branchId?: string;

  version: number; // last applied event version
  eventCount: number;

  createdAt: number;

  checksum?: string;
};