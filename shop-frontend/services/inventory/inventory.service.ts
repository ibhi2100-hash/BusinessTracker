import { addBrands, addCategories, addInventoryProducts, addProducts } from "@/offline/db/helpers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchProducts(branchId: string) {
  const res = await fetch(`${API_URL}/products?branchId=${branchId}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch products");

const data = res.json();
return data
}

;

export const fetchCategories = async () => {
  const res = await fetch(`${API_URL}/business/categories`, {
    credentials: "include",
  });
  const data = await res.json();

  return Array.isArray(data) ? data : data.categories || [];
};

export const fetchBrands = async (categoryId: string | undefined) => {
  if(!categoryId) return;
  const res = await fetch(
    `${API_URL}/business/brands?categoryId=${categoryId}`,
    { credentials: "include" }
  );
  const data = await res.json();

  return Array.isArray(data) ? data : data.brands || [];
};



export const fetchInventoryProducts = async (brandId: string) => {
  const res = await fetch(
    `${API_URL}/products/brands?brandId=${brandId}`,
    { credentials: "include" }
  );
  const data = await res.json();

 return Array.isArray(data) ? data : data.products || [];

};