"use client";

import { useStore } from "@/src/store/useStore";
import { useMemo, useState } from "react";
import { createSale } from "@/src/features/sales/actions/createSale";
import { ShoppingCart, X, CreditCard } from "lucide-react";
import { useSheet } from "@/src/components/sheets/sheetProvider";

export default function CartSheet() {
    const [loading, setLoading] = useState(false);
    const { closeSheet } = useSheet();

    const cartMap = useStore((s) => s.cart);
    const clearCart = useStore((s) => s.clearCart);

    const cart = useMemo(() => Object.values(cartMap), [cartMap]);

    const total = useMemo(() => {
        return cart.reduce(
            (sum: number, item: any) =>
                sum + item.price * item.quantity,
            0
        );
    }, [cart]);

    const handlePay = async () => {
        if (!cart.length) return;

        setLoading(true);

        try {
            await Promise.all(
                cart.map((item: any) =>
                    createSale(item.id, item.quantity, item.price)
                )
            );

            clearCart();
            closeSheet(); // ✅ close after payment
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white h-[65vh] rounded-t-3xl shadow-2xl">

            {/* HEADER */}
            <div className="flex justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-2">
                    <ShoppingCart size={18} />
                    Cart
                </h2>

                <button
                    onClick={closeSheet}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                    <X size={18} />
                </button>
            </div>

            {/* EMPTY */}
            {cart.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-gray-400">
                    Cart is empty
                </div>
            ) : (
                <>
                    {/* ITEMS */}
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {cart.map((item: any) => (
                            <div
                                key={item.id}
                                className="flex justify-between bg-gray-50 p-3 rounded-xl"
                            >
                                <div>
                                    <div className="font-medium text-sm">
                                        {item.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        ₦{item.price.toLocaleString()} × {item.quantity}
                                    </div>
                                </div>

                                <div className="font-semibold text-sm">
                                    ₦{(item.price * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FOOTER */}
                    <div className="pt-3 border-t">
                        <div className="flex justify-between text-sm mb-3">
                            <span>Total</span>
                            <span className="font-semibold">
                                ₦{total.toLocaleString()}
                            </span>
                        </div>

                        <button
                            onClick={handlePay}
                            disabled={loading}
                            className="w-full bg-green-500 text-white py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            <CreditCard size={18} />
                            {loading ? "Processing..." : "Pay Now"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}