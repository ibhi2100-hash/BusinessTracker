import { ProjectionConsumer } from "@business/event-bus";
import { DomainEvent } from "@business/shared-types";
import { changeNotifier } from "./changeNoifier";
import { SQLiteLedgerRepository } from "../repositories/SQLiteLedgerRepository/SQLiteLedgerRepository";
import { generateLedgerEntries } from "@business/ledger-engine";
import type { SQLiteStatementOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export class LedgerConsumer
  implements ProjectionConsumer<DomainEvent>
{
  readonly name = "ledger projection";

  constructor(
    private readonly repository: SQLiteLedgerRepository
  ) {}

  async handle(
    events: readonly DomainEvent[]
  ): Promise<void> {
    for (const event of events) {
      const entries = generateLedgerEntries(event);

      console.log(
        "These are the entries to be added to ledger table:",
        entries
      );

      await this.repository.append(entries);

      changeNotifier.notify(["ledger"]);
    }
  }

  buildOperations(
    events: readonly DomainEvent[]
  ): SQLiteStatementOperation[] {
    const operations: SQLiteStatementOperation[] = [];

    for (const event of events) {
      const entries = generateLedgerEntries(event);

      operations.push(
        ...this.repository.appendOperations(entries)
      );
    }

    return operations;
  }
}