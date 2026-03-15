
export interface Brand {
  id: string;
  name: string;
  categoryId: string;
}

export interface Product {
  id: string
  name: string
  imageUrl?: string
  sellingPrice: number
  quantity: number
  brand: Brand
  categoryName?: string
  brandName?: string
}