"use client";

import { useEffect, useMemo, useState } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import ProductModal from "./product-modal";
import CategoryCard from "./categoryCard";
import BrandDropdown from "./brandDropdown";
import ProductCard from "./productCard";
import { InventoryItem } from "@/types/types";
import { useBusinessStore } from "@/store/businessStore";
import { inventoryController } from "@/services/inventory/inventory.controller";
import { toast } from "sonner";
import { createSales } from "@/offline/sales/createSales";
import {
  startInventorySubscriber,
  stopInventorySubscriber,
} from "@/offline/subscribers/inventorySubscriber";
import { inventoryHelper } from "@/offline/inventory/newInventoryhelper";

interface InventoryPageProps {
  context: "sell" | "admin";
  mode: "OPENING" | "LIVE";
}

export default function InventoryPage({ context, mode }: InventoryPageProps) {
  const {
    categories,
    brands,
    products,
    selectedCategoryId,
    selectedBrandId,
    setSelectedCategoryId,
    setSelectedBrandId,
  } = useInventoryStore();



  const business = useBusinessStore((s) => s.business);
  const isOnboarding = business?.isOnboarding;

  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "create" | "edit";
    data?: InventoryItem;
  }>({
    open: false,
    mode: "create",
  });

  // -----------------------------
  // ✅ SUBSCRIBE (EVENT-DRIVEN)
  // -----------------------------
  useEffect(() => {
    startInventorySubscriber();
    return () => stopInventorySubscriber();
  }, []);

  // -----------------------------
  // ✅ DERIVED STATE (INSTANT)
  // -----------------------------
  const filteredBrands = useMemo(() => {
    if (!selectedCategoryId) return [];
    return brands.filter((b) => b.categoryId === selectedCategoryId);
  }, [brands, selectedCategoryId]);

  const filteredProducts = useMemo(() => {
    if (!selectedBrandId) return [];
    return products.filter((p) => p.brandId === selectedBrandId);
  }, [products, selectedBrandId]);

  // -----------------------------
  // ✅ HANDLERS
  // -----------------------------
  const handleEdit = (product: InventoryItem) => {
    setModalState({
      open: true,
      mode: "edit",
      data: product,
    });
  };

  const handleAdd = () => {
    setModalState({
      open: true,
      mode: "create",
    });
  };

  const handleSell = async (productId: string, quantity: number) => {
    const store = useInventoryStore.getState();
    const product = store.products.find((p) => p.id === productId);

    if (!product) return toast.error("Product not found");
    if (quantity <= 0) return toast.error("Quantity must be at least 1");
    if (quantity > product.quantity)
      return toast.error("Not enough stock");

    try {
      // ✅ Optimistic update
      store.updateProduct({
        ...product,
        quantity: product.quantity - quantity,
      });

      // ✅ Fire-and-forget (DO NOT BLOCK UI)
      createSales({
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
          },
        ],
        payments: [],
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
      });

      toast.success("Sale recorded");
    } catch (err) {
      toast.error("Failed to record sale");
      console.error(err);
    }
  };

  // -----------------------------
  // ✅ RENDER
  // -----------------------------
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
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onClick={() => setSelectedCategoryId(cat.id)}
          />
        ))}
      </div>

      {/* BRAND + ADD */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {selectedCategoryId && (
          <BrandDropdown 
            brands={filteredBrands}
            selectedBrandId={selectedBrandId}
            onSelect={setSelectedBrandId}
          />
        )}

        {context === "admin" && (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:shadow-lg transition"
            onClick={handleAdd}
          >
            Add Product
          </button>
        )}
      </div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            context={isOnboarding ? "admin" : context}
            onEdit={handleEdit}
            onSell={context === "sell" ? handleSell : undefined}
          />
        ))}
      </div>

      {/* MODAL */}
      <ProductModal
        isOpen={modalState.open}
        mode={modalState.mode}
        product={modalState.data}
        onClose={() =>
          setModalState({
            open: false,
            mode: "create",
          })
        }
        onSave={(payload) => {
          try {
            // ✅ NON-BLOCKING
            inventoryController.addOrUpdateProduct(payload);

            toast.success(
              modalState.mode === "edit"
                ? "Product updated"
                : "Product added"
            );

            setModalState({
              open: false,
              mode: "create",
            });
          } catch (err) {
            toast.error("Failed to save product");
            console.error(err);
          }
        }}
      />
    </div>
  );
}