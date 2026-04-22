"use client"
import { useStore } from "@/src/store/useStore";

export default function Cart() {
    const cart = useStore( (s) => s.cart);

    return (
        <div className="flex-1 overflow-y-auto p-4">
        { cart.length === 0 ? (
            <div className="text-center text-zinc-500">Your cart is empty</div>
        ) : (
            <div className="flex justify-between mb-3">
                {cart.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-zinc-300 pb-2">
                        <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-zinc-500">${item.price.toFixed(2)} x {item.quantity}</div>
                        </div>
                        <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                ))}
            </div>
        )}

    </div>
    )
}