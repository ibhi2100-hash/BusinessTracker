import { nanoid } from "nanoid";

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
}

export function createEntity<T extends object>(
  data: T
): T & BaseEntity {
  const now = new Date();

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
    updatedAt: new Date(),
    synced: false,
  };
}