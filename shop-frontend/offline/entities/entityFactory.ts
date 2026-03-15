import { v7 as uuidv7 } from "uuid"

export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt: number
  version: number
  synced: boolean
}

export function createEntity<T extends object>(
  data: T
): T & BaseEntity {

  const now = Date.now()

  return {
    ...data,
    id: uuidv7(),
    createdAt: now,
    updatedAt: now,
    version: 1,
    synced: false
  }
}

export function updateEntity<T>(entity: T & BaseEntity, updates: Partial<T>) {

  return {
    ...entity,
    ...updates,
    updatedAt: Date.now(),
    version: entity.version + 1,
    synced: false
  }
}