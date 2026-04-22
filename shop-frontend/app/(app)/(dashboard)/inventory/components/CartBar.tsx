"use client";

import { useSheet } from "@/src/components/sheets/sheetProvider";
import { useStore } from "@/src/store/useStore";
import { useMemo } from "react";
import { ShoppingCart } from "lucide-react";

export function CartBar() {
    const { openSheet } = useSheet();

    const cartMap = useStore((s) => s.cart);

    const total = useMemo(() => {
        return Object.values(cartMap).reduce(
            (sum: number, item: any) =>
                sum + item.price * item.quantity,
            0
        );
    }, [cartMap]);

    const itemCount = useMemo(() => {
        return Object.values(cartMap).reduce(
            (sum: number, item: any) => sum + item.quantity,
            0
        );
    }, [cartMap]);

    return (
        <div
            onClick={() => openSheet("cart")}
            className="fixed bottom-0 left-0 right-0 z-40 bg-black text-white p-4 flex justify-between items-center"
        >
            <div className="flex items-center gap-2">
                <ShoppingCart size={18} />
                <span>{itemCount} items</span>
            </div>

            <span className="font-semibold">
                ₦{total.toLocaleString()}
            </span>
        </div>
    );
}