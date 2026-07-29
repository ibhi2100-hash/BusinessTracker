// AggregateRepository.ts

import { AggregateRecord } from "./types";

export interface AggregateRepository {

  get(
    aggregateId: string,
    aggregateType: string
  ): Promise<AggregateRecord | null>;

  save(
    aggregate: AggregateRecord
  ): Promise<void>;

  exists(
    aggregateId: string,
    aggregateType: string
  ): Promise<boolean>;

  updateVersion(
    aggregateId: string,
    aggregateType: string,
    version: number,
    eventId?: string,
    globalPosition?: bigint
  ): Promise<void>;

  all(): Promise<AggregateRecord[]>;
}