export interface BaseEvent {
  id: string
  type: string
  payload: any
  businessId: string
  branchId: string
  userId: string
  status: "pending" | "synced" | "failed"
  createdAt: number
  updatedAt: number
  version: number
  synced: boolean
}
import { createEntity } from "@/offline/entities/entityFactory"

export function createEvent(
  type: string,
  userId: string,
  businessId: string,
  branchId: string,
  payload: any,
  status: "pending" | "synced" | "failed" = "pending"
) {

  return createEntity({
    type,
    payload,
    businessId,
    branchId,
    userId,
    status
  })
}