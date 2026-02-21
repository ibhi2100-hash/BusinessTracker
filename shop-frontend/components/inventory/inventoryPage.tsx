// pages/inventory.tsx
"use client";

import { useEffect, useState } from "react";
import { useInventoryStore, Product as StoreProduct } from "../../store/inventoryStore";
import BrandDropdown from "../../components/inventory/brandDropdown";
import ProductCard from "../../components/inventory/productCard";
import ProductModal from "../../components/inventory/product-modal";
import { useSalesStore } from "../../store/SalesStore";
import { toast } from "react-hot-toast"; 

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

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/brands?brandId=${selectedBrand.id}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => 
        { 
          setProducts(data)});
}, [selectedBrand, setProducts]);


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
// optional for notifications

const handleSell = async (productId: string, quantity: number) => {
  const updateProduct = useInventoryStore.getState().updateProduct;
  const addSale = useSalesStore.getState().addSale;
  const products = useInventoryStore.getState().products;

  try {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error("Product not found");

    const totalAmount = product.sellingPrice * quantity;

    const saleDto = {
      items: [{ productId, quantity }],
      payments: [{ method: "CASH", amount: totalAmount }],
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(saleDto),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Sale failed");
    }

    const sale = await response.json();

    // Update product quantity in inventory store
    updateProduct({
      ...product,
      quantity: product.quantity - quantity,
    });

    toast.success("Sale completed!");

    // Add sale to sales store
    addSale(sale);

  } catch (error: any) {
    console.error(error);
  }
};
  return (
    <div className="p-4 sm:p-6 md:p-8">
        <h1 className="text-[clamp(1.5rem,5vw,2rem)] font-bold mb-4 text-gray-800">
          {context === "sell" ? "Sell Products" : "Inventory"}
        </h1>

        {/* Category grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
          {categories.map(cat => (
            <div key={cat.id} className={`cursor-pointer border p-2 rounded-lg hover:shadow-md transition`} onClick={() => setSelectedCategory(cat)}>
              {cat.imageUrl && <img src={cat.imageUrl} className="w-full h-[clamp(3rem,10vw,5rem)] object-cover rounded" />}
              <p className="text-center text-[clamp(0.75rem,1.5vw,0.875rem)]">{cat.name}</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} context={context} onSell={handleSell} onEdit={handleEdit} onDelete={handleDelete} />
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
