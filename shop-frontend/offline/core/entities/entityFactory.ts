import { nanoid } from "nanoid";

export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

export function createEntity<T extends object>(
  data: T
): T & BaseEntity {
  const now = Date.now();

  return {
    ...data,
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
    synced: false,
  };
}

export function updateEntity<T>(
  entity: T & BaseEntity,
  updates: Partial<T>
) {
  return {
    ...entity,
    ...updates,
    updatedAt: Date.now(),
    synced: false,
  };
}