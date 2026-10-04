import { useRebuilderStore } from "../Biztru/store/ProjectionRebuilderStore";
import { ProjectionRebuilder } from "../Biztru/offline/sqlite/businessDatabase/projections/rebuild/ProjectionRebuilder"; 

export function useProjectionRebuilderController(projectionRebuilder: ProjectionRebuilder) {

  const start = useRebuilderStore(
    state => state.start
  );

  const setError = useRebuilderStore(
    state => state.setError
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