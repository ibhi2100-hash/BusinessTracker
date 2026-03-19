import { generateLedgerEntries } from "../ledgerGenerator/ledgerGenerator.js";

await db.transaction(async (tx) => {

  // 1. Idempotency check
  if (eventExists(event.id)) return;

  // 2. Save event
  await tx.event.create({ data: event });

  // 3. Generate ledger entries
  const entries = generateLedgerEntries(event);

  // 4. Save ledger
  await tx.ledger.createMany({ data: entries });

  // 5. Derive cashflow (projection)
  const cashflows = deriveCashflowEntries(entries);

  await tx.cashFlow.createMany({ data: cashflows });

});

function deriveCashflowEntries(ledgerEntries) {
  return ledgerEntries
    .filter(e => e.account === Accounts.CASH)
    .map(e => ({
      direction: e.amount > 0 ? "IN" : "OUT",
      amount: Math.abs(e.amount),
    }));
}