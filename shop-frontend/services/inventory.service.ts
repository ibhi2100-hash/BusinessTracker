const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchProducts(branchId: string) {
  const res = await fetch(`${API_URL}/products?branchId=${branchId}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch products");

  return res.json();
}