"use client";

import { useState } from "react";
import { getDB } from "@/src/offline/sqlite/database/db";

type Row = Record<string, any>;

export default function SQLConsole() {
  const [sql, setSql] = useState(`
SELECT name
FROM sqlite_master
WHERE type='table'
ORDER BY name;
`);

  const [result, setResult] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runQuery() {
    try {
      setLoading(true);
      setError("");

      const db = getDB();

      const rows = await db.query<Row>(sql);

      setResult(rows);

      console.log(rows);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">

      <h2 className="text-xl font-bold">
        SQL Console
      </h2>

      {error && (
        <div className="border border-red-500 p-3 rounded">
          {error}
        </div>
      )}

      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        className="w-full h-40 border rounded p-3 bg-black"
      />

      <div className="flex gap-2 flex-wrap">

        <button
          onClick={runQuery}
          className="border px-4 py-2 rounded"
        >
          Execute
        </button>

        <button
          onClick={() =>
            setSql(`
SELECT name
FROM sqlite_master
WHERE type='table'
ORDER BY name;
`)
          }
          className="border px-4 py-2 rounded"
        >
          Tables
        </button>

        <button
          onClick={() =>
            setSql(`
SELECT *
FROM events
ORDER BY created_at DESC
LIMIT 100;
`)
          }
          className="border px-4 py-2 rounded"
        >
          Events
        </button>

        <button
          onClick={() =>
            setSql(`
SELECT *
FROM snapshots
ORDER BY version DESC;
`)
          }
          className="border px-4 py-2 rounded"
        >
          Snapshots
        </button>

        <button
          onClick={() =>
            setSql(`
SELECT *
FROM conflicts;
`)
          }
          className="border px-4 py-2 rounded"
        >
          Conflicts
        </button>

        <button
          onClick={() =>
            setSql(`
SELECT *
FROM aggregate_versions;
`)
          }
          className="border px-4 py-2 rounded"
        >
          Versions
        </button>

      </div>

      <div className="text-sm opacity-70">
        Rows: {result.length}
      </div>

      <ResultTable rows={result} />

      {loading && (
        <div>
          Executing...
        </div>
      )}

    </div>
  );
}

function ResultTable({
  rows,
}: {
  rows: Row[];
}) {
  if (!rows.length) {
    return (
      <div className="opacity-70">
        No rows returned
      </div>
    );
  }

  const columns = Object.keys(rows[0]);

  return (
    <div className="overflow-auto max-h-[500px]">

      <table className="w-full border-collapse">

        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="border px-2 py-1 text-left"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>

          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td
                  key={column}
                  className="border px-2 py-1 align-top"
                >
                  {typeof row[column] === "object"
                    ? JSON.stringify(
                        row[column],
                        null,
                        2
                      )
                    : String(row[column])}
                </td>
              ))}
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}