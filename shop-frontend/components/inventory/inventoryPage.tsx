// pages/inventory.tsx
"use client";

import { useEffect, useState } from "react";
import { useInventoryStore, Product as StoreProduct } from "../../store/inventoryStore";
import BrandDropdown from "../../components/inventory/brandDropdown";
import ProductCard from "../../components/inventory/productCard";
import ProductModal from "../../components/inventory/product-modal";

export default function InventoryPage({ context }: { context: "sell" | "admin" }) {
  const {
    categories,
    brands,
    products,
    selectedCategory,
    selectedBrand,
    setCategories,
    setBrands,
    setProducts,
    setSelectedCategory,
    setSelectedBrand,
    addProduct,
    updateProduct,
    removeProduct
  } = useInventoryStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | undefined>();

  // Fetch categories
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/categories`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        console.log("categories Response:", data);
        setCategories(data);
      })
      .catch(err => console.error("Failed to fetch categories:", err));
  }, [setCategories]);

  // Fetch brands when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setBrands([]);
      setProducts([]);
      setSelectedBrand(undefined);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/brands?categoryId=${selectedCategory.id}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(err => console.error("Failed to fetch brands:", err));
  }, [selectedCategory, setBrands, setProducts, setSelectedBrand]);

  // Fetch products when brand changes
  useEffect(() => {
    if (!selectedBrand) {
      setProducts([]);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?brandId=${selectedBrand.id}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
            const normalizedProducts = data.map((p: any) => ({
                ...p,
                sellingPrice: Number(p.sellingPrice),
                costPrice: Number(p.costPrice),
                brand: {
                id: p.brandId,
                name: "", // optional until brands loaded
                categoryId: p.categoryId
                }
            }));

  setProducts(normalizedProducts);
})
      .catch(err => console.error("Failed to fetch products:", err));
  }, [selectedBrand, setProducts]);
  console.log(products)

  // Save (add or edit) product
  const handleSave = async (product: any) => {
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct
      ? `${process.env.NEXT_PUBLIC_API_URL}/products/${editingProduct.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/products/create`;

    // Optimistic UI update
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...product });
    } else {
      const tempId = "temp-" + Math.random().toString(36).substring(2);
      addProduct({ ...product, id: tempId, brand: selectedBrand });
    }

    setModalOpen(false);
    setEditingProduct(undefined);

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(product),
      });
      const saved = await res.json();

      // Replace temp product with actual server product
      if (!editingProduct) updateProduct(saved);
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    }
  };

  const handleEdit = (product: StoreProduct) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    removeProduct(productId);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const handleSell = (productId: string, quantity: number) => {
    console.log("Sell", productId, quantity);
    // Implement sell logic here
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {context === "sell" ? "Sell Products" : "Inventory"}
      </h1>

      {/* Category selection */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`border p-2 rounded cursor-pointer ${
              selectedCategory?.id === cat.id ? "border-blue-600" : "border-gray-300"
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.imageUrl && (
              <img src={cat.imageUrl} alt={cat.name} className="w-full h-16 object-cover mb-2 rounded" />
            )}
            <div className="text-center">{cat.name}</div>
          </div>
        ))}
      </div>

      {/* Brand dropdown */}
      {selectedCategory && <BrandDropdown />}

      {/* Add product button */}
      {context === "admin" && (
        <button
          className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => setModalOpen(true)}
        >
          Add Product
        </button>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            context={context}
            onSell={handleSell}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Add/Edit product modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        product={editingProduct}
      />
    </div>
  );
}
