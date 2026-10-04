
export type ProductUpdateInput = {
  productId: string;
  name?: string;
  price?: number;
  costPrice?: number;
  quantity?: number; // optional stock adjustment
};

export function computeProductDiff(oldP: any, newP: any) {
  return {
    productChanged:
      oldP.name !== newP.name ||
      oldP.price !== newP.price ||
      oldP.costPrice !== newP.costPrice,

    stockChanged:
      oldP.quantity !== newP.quantity,
  };
}