import { inventoryHelper } from "./inventoryHelper";
import { useInventoryStore } from "@/store/inventoryStore";

export async function inventoryLoader() {
  const categories = await inventoryHelper.getCategories();

  useInventoryStore.getState().setCategories(categories);
}

export async function loadBrands(categoryId: string) {
  const brands = await inventoryHelper.getBrandsByCategory(categoryId);

  useInventoryStore.getState().setBrands(brands);
}

export async function loadProducts(brandId: string) {
  const products = await inventoryHelper.getProductsByBrand(brandId);

  useInventoryStore.getState().setProducts(products);
  return products;
}