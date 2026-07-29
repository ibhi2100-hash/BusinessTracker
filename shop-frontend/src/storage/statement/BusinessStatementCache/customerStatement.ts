import { Phone } from "lucide-react";
import { QueryRunner } from "../../queryRunner/QueryRunner";
import { SQLiteRuntime } from "../../runtime/SQLiteRuntime";

export async function CustomerStatements(){
    const runtime = new SQLiteRuntime();
    const runner = new QueryRunner(runtime)

    runner.prepare(
        "customer.insert",

            `
        INSERT INTO Customer(
            id,
            name
        )
        VALUES(?,?)
        `
    )
}