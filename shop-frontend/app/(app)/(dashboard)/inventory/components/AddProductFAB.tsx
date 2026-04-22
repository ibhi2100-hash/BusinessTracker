"use client"

import { Plus } from "lucide-react"
import { useSheet } from "@/src/components/sheets/sheetProvider";

export default function AddProductFAB() {
    const { openSheet, sheet } = useSheet();

    // hide when any sheet is open (iOS behavior)
    if (sheet) return null;

    return (
        <button
            onClick={() => openSheet("addProduct")}
            className="fixed bottom-20 right-4 z-50 bg-black text-white p-4 rounded-full shadow-lg active:scale-95"
        >
            <Plus />
        </button>
    );
}