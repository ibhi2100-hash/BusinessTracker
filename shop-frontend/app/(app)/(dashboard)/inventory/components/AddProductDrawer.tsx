"use client";

import { useEffect, useState } from "react";
import { useSheet } from "@/src/components/sheets/sheetProvider";
import { createProduct } from "@/src/features/products/actions/createProduct";
import { Package, Tag, DollarSign, Boxes, Layers, X } from "lucide-react";

type InputProps = {
    icon: any;
} & React.InputHTMLAttributes<HTMLInputElement>;

function Input({ icon: Icon, ...props }: InputProps) {
    return (
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-black transition">
            <Icon size={18} className="text-gray-500" />
            <input
                {...props}
                className="bg-transparent w-full outline-none text-sm"
            />
        </div>
    );
}

export default function AddProductDrawer() {
    const { closeSheet } = useSheet();

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [qty, setQty] = useState("");
    const [cost, setCost] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);

    const isValid = name && price && qty && cost;

    // lock scroll when mounted
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const handleSave = async () => {
        if (!isValid || loading) return;

        setLoading(true);

        try {
            await createProduct({
                name,
                price: Number(price),
                quantity: Number(qty),
                cost: Number(cost),
                category
            });

            closeSheet(); // ✅ global close
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white h-[70vh] rounded-t-3xl p-5 shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Add Product</h2>

                <button
                    onClick={closeSheet}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                    <X size={18} />
                </button>
            </div>

            {/* FORM */}
                        <div className="space-y-3">
                    <Input
                        icon={Package}
                        placeholder="Product name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Input
                        icon={DollarSign}
                        type="number"
                        placeholder="Selling price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />

                    <Input
                        icon={Boxes}
                        type="number"
                        placeholder="Quantity"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                    />

                    <Input
                        icon={Tag}
                        type="number"
                        placeholder="Cost price"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                    />

                    <Input
                        icon={Layers}
                        placeholder="Category (optional)"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </div>
            <button
                onClick={handleSave}
                disabled={!isValid || loading}
                className="mt-5 w-full py-3 rounded-xl bg-black text-white"
            >
                {loading ? "Saving..." : "Save Product"}
            </button>
        </div>
    );
}