// offline/sqlite/repositories/IProjectionEntityRepository.ts

export interface IProjectionEntityRepository<T> {
  findById(id: string): Promise<T | null>;

  findAll(): Promise<T[]>;

  upsert(
    id: string,
    state: T
  ): Promise<void>;

  delete(id: string): Promise<void>;
}