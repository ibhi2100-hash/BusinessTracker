// hooks/useLiveQuery.ts
import { useState, useCallback, useEffect, useMemo } from "react";
import { changeNotifier } from "@/src/offline/sqlite/businessDatabase/projections/changeNoifier";

export function useLiveQuery<T>(
  dependencies: string[],
  query: () => Promise<T>,
  initialValue: T
) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  // Stabilize the dependency array so identity changes don't cause resubscriptions
  const dependencyKey = useMemo(
    () => dependencies.slice().sort().join("|"),
    [dependencies]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await query();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();

    const unsubscribe = changeNotifier.subscribe((tables) => {
      const interested = tables.some((table) =>
        dependencies.includes(table)
      );
      if (interested) {
        load();
      }
    });

    return unsubscribe;
  }, [load, dependencyKey]); // dependencyKey instead of the array itself

  return {
    data,
    loading,
    error,
    refresh: load,
  };
}