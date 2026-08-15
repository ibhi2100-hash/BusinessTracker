import {
  LedgerEntry
} from "@business/shared-types";


export class LedgerMapper {

  static toInsert(
    entry: LedgerEntry
  ): unknown[] {

    return [
      entry.id,
      entry.eventId,
      entry.businessId,
      entry.branchId,
      entry.type,
      entry.account,
      entry.direction,
      entry.amount,
      entry.index,
      entry.createdAt
    ];

  }

}