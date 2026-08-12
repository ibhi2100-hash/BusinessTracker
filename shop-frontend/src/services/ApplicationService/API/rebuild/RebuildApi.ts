import { BusinessManager } from "@/src/Composer/BusinessManager";
import { 
  ProjectionRebuildOptions, 
  ProjectionRebuildResult 
} from "@/src/offline/sqlite/businessDatabase/projections/rebuild/types";

export class RebuildApi {
  constructor(
    private readonly manager: BusinessManager
  ) {}

  /**
   * Rebuild projections for the currently open business.
   */
  async rebuildCurrent(
    options: ProjectionRebuildOptions = {}
  ): Promise<ProjectionRebuildResult> {
    const app = this.manager.current();

    if (!app) {
      throw new Error("No business is currently open");
    }

    return app.rebuildProjections(options);
  }

  /**
   * Rebuild projections for a specific business.
   * Opens the business if it is not already running.
   */
  async rebuild(
    businessId: string,
    options: ProjectionRebuildOptions = {}
  ): Promise<ProjectionRebuildResult> {
    const app = await this.manager.open(businessId);
    return app.rebuildProjections(options);
  }
}