import { BaseEntity } from "../entityFactory"
export interface ProductEntity extends BaseEntity {
  name: string
  imageUrl?: string
  description?: string
  sellingPrice: number
  costPrice?: number
  quantity: number
  brandId: string
  categoryId: string
  businessId: string
  branchId: string
}