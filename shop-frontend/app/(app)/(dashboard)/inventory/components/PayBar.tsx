"use client";

import { useStore } from "@/src/store/useStore";
import { createSale } from "@/src/features/sales/actions/createSale";

export default function PayBar() {
    const cart = useStore( (s) => s.cart);
    const clearCart = useStore( (s) => s.clearCart);

    const total = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    const handlePay = () => {
        cart.forEach((item: any) => {
            createSale(item.id, item.quantity, item.price);
        });
        clearCart();
    }

    return (
        <div className="p-4 border-t border-zinc-300 flex items-center justify-between">
            <div className="text-lg font-medium">Total: ${total.toFixed(2)}</div>
            <button onClick={handlePay} disabled={cart.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-zinc-300">Pay</button>
        </div>
    )
}