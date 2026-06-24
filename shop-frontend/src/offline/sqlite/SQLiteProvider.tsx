"use client";

import { useEffect } from "react";
import { getDB } from "./database/db";
import { MigrationRunner } from "./migrations/MigrationRunner";

export function SQLiteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const boot = async () => {
      const db = getDB()

      await db.init();
      const runner = new MigrationRunner();

      await runner.run()

      await db.query(`
        CREATE TABLE IF NOT EXISTS test (
          id TEXT PRIMARY KEY,
          name TEXT
        )
      `);

      await db.query(
      `INSERT INTO test (id, name) VALUES (?, ?)`,
      ["1", "BizTru"]
    );

    const result = await db.query(`SELECT * FROM test`);
     console.log(result); 
      console.log("SQLite Ready");
    };

    boot().catch(console.error);
  }, []);

  return <>{children}</>;
}