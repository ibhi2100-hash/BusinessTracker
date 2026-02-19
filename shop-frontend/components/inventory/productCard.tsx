// components/ProductCard.tsx
import { Product } from "../../store/inventoryStore";
import { useState } from "react";

interface Props {
  product: Product;
  context: "sell" | "admin";
  onSell?: (productId: string, quantity: number) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export default function ProductCard({ product, context, onSell, onEdit, onDelete }: Props) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="border p-4 rounded shadow flex flex-col gap-2">
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-500">{product.description || "-"}</p>
      <p>Brand: {product.brand.name}</p>
      <p>Price: ${product.sellingPrice}</p>
      <p>Available: {product.quantity}</p>

      {context === "sell" && onSell && (
        <div className="flex gap-2 mt-2 items-center">
          <input
            type="number"
            min={1}
            max={product.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border p-1 rounded w-16"
          />
          <button
            className="bg-green-600 text-white px-3 py-1 rounded"
            onClick={() => onSell(product.id, quantity)}
          >
            Sell
          </button>
        </div>
      )}

      {context === "admin" && (
        <div className="flex gap-2 mt-2">
          <button className="bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => onEdit?.(product)}>
            Edit
          </button>
          <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => onDelete?.(product.id)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
