import { Scope } from "../enums/Scope";

export interface Snapshot <T = any> {

  id: string;

  snapshotKey: string;

  snapshotType: string;

  scope: Scope;

  aggregateId?: string;

  aggregateType?: string;

  businessId?: string;

  branchId?: string;

  state: T;

  version: number;

  eventCount: number;

  lastGlobalPosition: bigint;

  checksum?: string;

  createdAt: number;

  updatedAt: number;
}