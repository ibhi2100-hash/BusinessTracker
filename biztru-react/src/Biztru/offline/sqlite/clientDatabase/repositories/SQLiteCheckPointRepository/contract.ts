export interface CheckpointRepository {

  getLastPosition(): Promise<bigint>;

  saveLastPosition(
    position: bigint
  ): Promise<void>;
}