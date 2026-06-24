interface ProjectionTable<T> {
  findById(id: string): Promise<T | null>;

  upsert(
    id: string,
    state: T
  ): Promise<void>;
}