import { PreparedStatement } from "../../../PreparedStatement/PreparedStatementContract";

export class LedgerStatements {

    readonly append: PreparedStatement;

    readonly balance: PreparedStatement;

    readonly entries: PreparedStatement;

    constructor(
        manager: PreparedStatementManager
    ) {

        this.append =
            manager.statement(
                "ledger.append",
                `
INSERT INTO ledger_entries(
    id,
    accountId,
    debit,
    credit,
    createdAt
)
VALUES (?, ?, ?, ?, ?)
`
            );

        this.balance =
            manager.statement(
                "ledger.balance",
                `
SELECT
COALESCE(SUM(debit-credit),0) AS balance
FROM ledger_entries
WHERE accountId = ?
`
            );

        this.entries =
            manager.statement(
                "ledger.entries",
                `
SELECT *
FROM ledger_entries
WHERE accountId = ?
ORDER BY createdAt
`
            );

    }

}