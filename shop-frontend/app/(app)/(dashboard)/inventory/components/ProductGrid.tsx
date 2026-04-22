"use client";

import { useStore } from "@/src/store/useStore";
import { Package, ShoppingCart, AlertTriangle } from "lucide-react";
import { useRef, useState } from "react";

export default function ProductGrid({ products }: any) {
    const addToCart = useStore((s) => s.addToCart);

    const [activeProduct, setActiveProduct] = useState<string | null>(null);
    const [qty, setQty] = useState("1");

    const timerRef = useRef<any>(null);

    const handlePressStart = (product: any) => {
        timerRef.current = setTimeout(() => {
            setActiveProduct(product.id);
            setQty("1");
        }, 400); // long press threshold
    };

    const handlePressEnd = (product: any) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);

            // if long press didn't trigger → normal tap
            if (activeProduct !== product.id) {
                addToCart(product);
            }
        }
    };

    const handleAddQty = (product: any) => {
        const quantity = Number(qty) || 1;

        for (let i = 0; i < quantity; i++) {
            addToCart(product.id);
        }

        setActiveProduct(null);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {products.map((p: any) => {
                const lowStock = p.quantity <= 5;
                const isActive = activeProduct === p.id;

                return (
                    <div key={p.id} className="relative">
                        
                        {/* CARD */}
                        <button
                            onMouseDown={() => handlePressStart(p)}
                            onMouseUp={() => handlePressEnd(p)}
                            onTouchStart={() => handlePressStart(p)}
                            onTouchEnd={() => handlePressEnd(p)}
                            className="
                                group w-full flex flex-col justify-between
                                bg-white rounded-2xl p-4
                                border border-gray-200
                                shadow-sm
                                hover:shadow-md
                                active:scale-[0.98]
                                transition
                            "
                        >
                            {/* Top */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-gray-100 rounded-xl">
                                        <Package size={16} />
                                    </div>
                                    <div className="text-sm font-medium text-left">
                                        {p.name}
                                    </div>
                                </div>

                                <ShoppingCart
                                    size={16}
                                    className="opacity-0 group-hover:opacity-100"
                                />
                            </div>

                            {/* Price */}
                            <div className="mt-4 text-lg font-semibold">
                                ₦{Number(p.price).toLocaleString()}
                            </div>

                            {/* Stock */}
                            <div
                                className={`text-xs mt-2 flex items-center gap-1 ${
                                    lowStock ? "text-red-500" : "text-gray-500"
                                }`}
                            >
                                {lowStock && <AlertTriangle size={12} />}
                                {p.quantity} in stock
                            </div>
                        </button>

                        {/* 🔥 QUICK QTY INPUT */}
                        {isActive && (
                            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                                <div className="bg-white p-3 rounded-xl shadow-lg flex items-center gap-2">
                                    
                                    <input
                                        type="number"
                                        value={qty}
                                        onChange={(e) => setQty(e.target.value)}
                                        className="w-16 text-center border rounded-lg p-1"
                                        autoFocus
                                    />

                                    <button
                                        onClick={() => handleAddQty(p)}
                                        className="bg-black text-white px-3 py-1 rounded-lg text-sm"
                                    >
                                        Add
                                    </button>

                                    <button
                                        onClick={() => setActiveProduct(null)}
                                        className="text-gray-500 text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}