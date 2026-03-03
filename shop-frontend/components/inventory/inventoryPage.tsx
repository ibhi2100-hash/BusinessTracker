// pages/inventory.tsx
"use client";

import { useEffect, useState } from "react";
import { useInventoryStore, Product as StoreProduct } from "../../store/inventoryStore";
import BrandDropdown from "../../components/inventory/brandDropdown";
import ProductCard from "../../components/inventory/productCard";
import ProductModal from "../../components/inventory/product-modal";
import { useSalesStore } from "../../store/SalesStore";
import { useBusinessStatus } from "@/hooks/useBusinessStatus";
// Fetch Services
import { fetchCategories, fetchBrands, fetchInventoryProducts } from "@/services/inventory.service";

import { toast } from "sonner"; 


interface InventoryPageProps {
  context: "sell" | "admin";
  mode: "OPENING" | "LIVE";
}

export default function InventoryPage({ context, mode}: InventoryPageProps) {
  const {
    categories,
    brands,
    products,
    selectedCategoryId,
    selectedBrandId,
    setCategories,
    setBrands,
    setProducts,
    setSelectedCategoryId,
    setSelectedBrandId,
    addProduct,
    updateProduct,
    removeProduct
  } = useInventoryStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | undefined>();

  const { data: business} = useBusinessStatus();
  const isOnboarding = business?.isOnboarding;

  // Fetch categories
  useEffect(() => {
    fetchCategories(setCategories)
  }, []);

  // Fetch brands when category changes
  useEffect(() => {
    if (!selectedCategoryId) return;
    fetchBrands(selectedCategoryId, setBrands);
  }, [selectedCategoryId]);

  // Fetch products when brand changes
  useEffect(() => {
    if (!selectedBrandId) return;
    fetchInventoryProducts(selectedBrandId, setProducts);
}, [selectedBrandId]);


  // Save (add or edit) product
  const handleSave = async (product: any) => {
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct
      ? `${process.env.NEXT_PUBLIC_API_URL}/products/${editingProduct.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/products/create`;

    const payloadWithMode = {
      ...product,
      stockMode: mode === "OPENING" ? "OPENING" : "PURCHASE",
    };
    setModalOpen(false);
    setEditingProduct(undefined);


    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payloadWithMode),
      });
      const saved = await res.json();

      toast.success(editingProduct ? "Product updated" : "Product created");
      
      if(selectedCategoryId) {
        await fetchBrands(selectedCategoryId, setBrands)
      }
      if(selectedBrandId) {
        await fetchInventoryProducts(selectedBrandId, setProducts);
      }

      await fetchCategories(setCategories)
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to save Product")
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
  if (mode === "OPENING") {
      toast.error("You cannot sell before activating business.");
      return;
    }
  if(isOnboarding) {
      toast.error("Business not activated yet")
    }
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
    toast.success("✅ Successfully Sold Item")

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
  return (<>
    
    <div className="p-4 sm:p-6 md:p-8">
        <h1 className="text-[clamp(1.5rem,5vw,2rem)] font-bold mb-4 text-gray-800">
          {context === "sell" ? "Sell Products" : "Inventory"}
        </h1>
        {mode === "OPENING" && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            Opening Mode: Inventory changes will not affect cashflow.
          </div>
        )}

        {/* Category grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
          {categories.map(cat => (
            <div key={cat.id} className={`cursor-pointer border p-2 rounded-lg hover:shadow-md transition`} onClick={() => setSelectedCategoryId(cat.id)}>
              {cat.imageUrl && <img src={cat.imageUrl} className="w-full h-[clamp(3rem,10vw,5rem)] object-cover rounded" />}
              <p className="text-center text-[clamp(0.75rem,1.5vw,0.875rem)]">{cat.name}</p>
            </div>
          ))}
        </div>


      {/* Brand dropdown */}
      {selectedCategoryId && <BrandDropdown />}

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
          <ProductCard 
            key={p.id} 
            product={p} 
            context={isOnboarding ? "admin" : context} 
            onSell={!isOnboarding ? handleSell : undefined} 
            onEdit={handleEdit} 
            onDelete={handleDelete} />
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
    </>
  );
}
