"use client";

import { useEffect } from "react";
import { getDB } from "./database/db";
import { MigrationRunner } from "./businessDatabase/migrations/MigrationRunner";

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

    };

    boot().catch(console.error);
  }, []);

  return <>{children}</>;
}