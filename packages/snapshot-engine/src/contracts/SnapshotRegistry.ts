import { SnapshotReducer } from "./SnapshotReducer";

export class SnapshotRegistry {

  private reducers =
    new Map<string, SnapshotReducer>();

  register(
    reducer: SnapshotReducer
  ): void {

    this.reducers.set(
      reducer.aggregateType,
      reducer
    );
  }

  get(
    aggregateType: string
  ): SnapshotReducer | undefined {

    return this.reducers.get(
      aggregateType
    );
  }
}