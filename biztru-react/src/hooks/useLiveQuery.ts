// hooks/useLiveQuery.ts

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  changeNotifier,
} from "../Biztru/offline/sqlite/businessDatabase/projections/changeNoifier";


export function useLiveQuery<T>(
  dependencies: string[],
  query: () => Promise<T | null>,
  initialValue: T | null
) {
  const [data, setData] = useState<T | null>(
    initialValue
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<unknown>(null);


  /* =========================================================
     REQUEST VERSION
     ========================================================= */

  const requestId = useRef(0);


  /* =========================================================
     STABILIZE DEPENDENCIES
     ========================================================= */

  const dependencyKey = useMemo(
    () =>
      dependencies
        .slice()
        .sort()
        .join("|"),
    [dependencies]
  );


  /* =========================================================
     LOAD
     ========================================================= */

  const load = useCallback(
    async () => {

      const id =
        ++requestId.current;

      setLoading(true);
      setError(null);

      try {

        const result =
          await query();

        /*
         * Ignore stale requests.
         */
        if (
          id !== requestId.current
        ) {
          return;
        }

        setData(result);

      } catch (err) {

        if (
          id !== requestId.current
        ) {
          return;
        }

        setError(err);

      } finally {

        if (
          id === requestId.current
        ) {
          setLoading(false);
        }
      }

    },
    [query]
  );


  /* =========================================================
     LIVE SUBSCRIPTION
     ========================================================= */

  useEffect(() => {

    load();

    const unsubscribe =
      changeNotifier.subscribe(
        (tables) => {

          const interested =
            tables.some((table) =>
              dependencies.includes(table)
            );

          if (interested) {
            load();
          }
        }
      );

    return unsubscribe;

  }, [
    load,
    dependencyKey,
  ]);


  /* =========================================================
     RESULT
     ========================================================= */

  return {
    data,
    loading,
    error,
    refresh: load,
  };
}
