import { useRebuilderStore } from "../store/ProjectionRebuilderStore";
import { ProjectionRebuilder } from "@/src/offline/sqlite/businessDatabase/projections/rebuild/ProjectionRebuilder";

export function useProjectionRebuilderController(projectionRebuilder: ProjectionRebuilder) {

  const start = useRebuilderStore(
    state => state.start
  );

  const setStatus = useRebuilderStore(
    state => state.setStatus
  );

  const setError = useRebuilderStore(
    state => state.setError
  );

  const setEvents = useRebuilderStore(
    state => state.setEvents
  );

  async function rebuild() {
    try {
      start();

      await projectionRebuilder.rebuild();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : String(error)
      );
    }
  }

  return {
    rebuild,
  };
}