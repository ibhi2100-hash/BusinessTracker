// components/inventory/BrandDropdown.tsx
"use client";

import { useState } from "react";
import { useInventoryStore } from "../../store/inventoryStore";

export default function BrandDropdown() {
  const brands = useInventoryStore((state) => state.brands);
  const selectedBrandId = useInventoryStore((state) => state.selectedBrandId);
  const setSelectedBrandId = useInventoryStore((state) => state.setSelectedBrandId);

  const [open, setOpen] = useState(false);

  if (brands.length === 0) return null;

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);

  return (
    <div className="relative w-60 mb-4">
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center p-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all focus:outline-none"
      >
        <span className="text-gray-700">
          {selectedBrand ? selectedBrand.name : "Select Brand"}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transform transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {brands.map((b) => (
            <li
              key={b.id}
              onClick={() => {
                setSelectedBrandId(b.id);
                setOpen(false);
              }}
              className="cursor-pointer px-4 py-2 hover:bg-indigo-600 hover:text-white transition-colors"
            >
              {b.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}