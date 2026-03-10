import { addBrands, addCategories, addInventoryProducts, addProducts } from "@/offline/db/helpers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchProducts(branchId: string) {
  const res = await fetch(`${API_URL}/products?branchId=${branchId}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch products");

const data = res.json();
addProducts(data)

return data
}

;

export const fetchCategories = async (setCategories: any) => {
  const res = await fetch(`${API_URL}/business/categories`, {
    credentials: "include",
  });
  const data = await res.json();
  addCategories(Array.isArray(data) ? data: data.categories || [])
  setCategories(Array.isArray(data) ? data : data.categories || []);
};



export const fetchBrands = async (categoryId: string | undefined, setBrands: any) => {
  if(!categoryId) return;
  const res = await fetch(
    `${API_URL}/business/brands?categoryId=${categoryId}`,
    { credentials: "include" }
  );
  const data = await res.json();
  addBrands(Array.isArray(data) ? data: data.brands || []);
};



export const fetchInventoryProducts = async (brandId: string) => {
  const res = await fetch(
    `${API_URL}/products/brands?brandId=${brandId}`,
    { credentials: "include" }
  );
  const data = await res.json();
 await addInventoryProducts(Array.isArray(data) ? data: data.products || [])

 return Array.isArray(data) ? data : data.products || [];

};