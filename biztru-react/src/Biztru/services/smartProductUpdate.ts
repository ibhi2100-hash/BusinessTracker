
type ProductUpdateInput = {
  productId: string;
  name?: string;
  price?: number;
  costPrice?: number;
  quantity?: number; // optional stock adjustment
};

function computeProductDiff(oldP, newP) {
  return {
    productChanged:
      oldP.name !== newP.name ||
      oldP.price !== newP.price ||
      oldP.costPrice !== newP.costPrice,

    stockChanged:
      oldP.quantity !== newP.quantity,
  };
}