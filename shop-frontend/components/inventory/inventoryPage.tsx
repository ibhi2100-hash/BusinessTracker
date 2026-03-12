"use client";

import { useEffect, useState } from "react";
import { useInventoryStore, Product as StoreProduct } from "@/store/inventoryStore";
import BrandDropdown from "./brandDropdown";
import ProductCard from "./productCard";
import ProductModal from "./product-modal";
import CategoryCard from "./categoryCard";

import { useBusinessStore } from "@/store/businessStore";
import { inventoryController } from "@/services/inventory/inventory.controller";
import { useSalesStore } from "@/store/SalesStore";
import { toast } from "sonner";
import { dispatchEvent } from "@/offline/events/eventDispatcher";
import { EventTypes } from "@/offline/events/eventTypes";
import { getCategories } from "@/offline/db/helpers";

interface InventoryPageProps {
  context: "sell" | "admin";
  mode: "OPENING" | "LIVE";
}

export default function InventoryPage({ context, mode }: InventoryPageProps) {
  
  // Load categories
  useEffect(() => {
    inventoryController.loadCategories();
  }, []);

  const {
    categories,
    brands,
    products,
    selectedCategoryId,
    selectedBrandId,
    setSelectedCategoryId,
    setSelectedBrandId,
  } = useInventoryStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | undefined>();

  const business = useBusinessStore(s => s.business);
  const isOnboarding = business?.isOnboarding;

  // Load brands for selected category
  useEffect(() => {
    if (selectedCategoryId) {
       const brand = inventoryController.loadBrands(selectedCategoryId);
      useInventoryStore.getState().setProducts([])
    }
  }, [selectedCategoryId]);

  // Load products for selected brand
  useEffect(() => {
    if (selectedBrandId) {
      inventoryController.loadProducts(selectedBrandId);
    }
  }, [selectedBrandId]);

  const handleEdit = (product: StoreProduct) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSell = async (productId: string, quantity: number) => {
    const inventoryStore = useInventoryStore.getState();
    const saleStore = useSalesStore.getState();

    const product = inventoryStore.products.find(p=> p.id === productId);
    if(!product) return toast.error("Product not found in inventory");

    if(quantity <= 0) return toast.error("Quantity must be at least 1");

    if(quantity > product.quantity) return toast.error("Not enough stock available");

    try {
      //update inventory store optimistically
      inventoryStore.updateProduct({
        ...product,
        quantity: product.quantity - quantity
      });

      // Create the sale payload

      const salePayload = {
        id: crypto.randomUUID(),
        businessId: business?.id || "",
        productId: product.id,
        quantity,
        amount: product.sellingPrice * quantity,
        cost: product.costPrice * quantity,
        totalAmount: product.sellingPrice * quantity,
        items: [
          {
            productId: product.id,
            quantity,
            unitPrice: product.sellingPrice,
            totalPrice: product.sellingPrice * quantity,
          }
        ],
        payments: [],
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
      };

      //save sale in offline events system
      await dispatchEvent(EventTypes.SALE_ADDED, salePayload);
      //Optionally add to sales store for immediate Ui update
      saleStore.addSale(salePayload);

      toast.success("Sale recorded successfully(offline-safe)");

    }
    catch(err){
      toast.error("Failed to record sale. Please try again.");
      console.error("Error recording sale:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">

      <h1 className="text-[clamp(1.5rem,5vw,2rem)] font-bold mb-4 text-gray-800">
        {context === "sell" ? "Sell Products" : "Inventory"}
      </h1>

      {mode === "OPENING" && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          Opening Mode: Inventory changes will not affect cashflow.
        </div>
      )}

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
        {categories.map(cat => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onClick={() => setSelectedCategoryId(cat.id)}
          />
        ))}
      </div>

      {/* BRAND DROPDOWN + ADD PRODUCT */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {selectedCategoryId && (
          <BrandDropdown />
        )}

        {context === "admin" && (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:shadow-lg transition"
            onClick={() => setModalOpen(true)}
          >
            Add Product
          </button>
        )}
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index ) => (

          <ProductCard
            key={product.id ?? `product-${index}`} // fallback key if id is missing
            product={product}
            context={isOnboarding ? "admin" : context}
            onEdit={handleEdit}
            onSell={context === "sell" ? handleSell : undefined}
          />
        ))}
      </div>

      {/* PRODUCT MODAL */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editingProduct}
        onSave={(payload) => {
          setModalOpen(false);
          setEditingProduct(undefined);
          // Call inventoryController.addOrUpdateProduct(payload)
          inventoryController.addOrUpdateProduct(payload).then(() => {
            toast.success(`Product ${editingProduct ? "updated" : "added"} successfully`);
            inventoryController.loadCategories();
          }).catch(err => {
            toast.error(`Failed to ${editingProduct ? "update" : "add"} product. Please try again.`);
            console.error("Error saving product:", err);
          });
        }}
      />

    </div>
  );
}