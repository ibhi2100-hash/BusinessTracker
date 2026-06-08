import  { BaseEvent } from "@business/shared-types"
export class SnapshotEngine {
  private repo!: any;

  async process(
    aggregateId: string,
    reducer: any,
    event: BaseEvent
  ) {

    const snapshot =
      await this.repo.get(
        aggregateId
      );

    const currentState =
      snapshot?.state ??
      reducer.initialState();

    const nextState =
      reducer.reduce(
        currentState,
        event
      );

    await this.repo.save({
      aggregateId,
      state: nextState
    });
  }
}