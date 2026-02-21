// components/ProductCard.tsx
import { Product } from "../../store/inventoryStore";
import { useState } from "react";
import { ShoppingCart, Edit2, Trash2, Tag, Package } from "lucide-react";

interface Props {
  product: Product;
  context: "sell" | "admin";
  onSell?: (productId: string, quantity: number) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export default function ProductCard({ product, context, onSell, onEdit, onDelete }: Props) {
  const [quantity, setQuantity] = useState(1);

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(product.quantity, q + 1));

  return (
    <div className="bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-xl overflow-hidden transform hover:scale-[1.02] w-full max-w-[350px] mx-auto sm:max-w-[300px] md:max-w-[280px]">
      
      {/* Product Image */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-[20vh] sm:h-[25vh] md:h-[30vh] object-cover"
        />
      ) : (
        <div className="w-full h-[20vh] sm:h-[25vh] md:h-[30vh] bg-gray-100 flex items-center justify-center text-gray-400">
          No Image
        </div>
      )}

      <div className="p-[clamp(0.5rem,2vw,1rem)] flex flex-col gap-[clamp(0.25rem,1vw,0.5rem)] flex-1">
        {/* Product Name */}
        <h3 className="font-bold text-[clamp(1rem,4vw,1.25rem)] text-gray-800">{product.name}</h3>

        {/* Description */}
        <p className="text-[clamp(0.75rem,3vw,0.875rem)] text-gray-500 line-clamp-2">
          {product.description || "No description"}
        </p>

        {/* Brand and Price */}
        <div className="flex justify-between items-center mt-1">
          <span className="flex items-center gap-1 text-[clamp(0.65rem,2.5vw,0.75rem)] text-gray-600">
            <Package className="w-4 h-4 text-gray-500" /> {product.brand.name}
          </span>
          <span className="flex items-center gap-1 text-[clamp(0.75rem,3vw,1rem)] font-semibold text-green-700">
            <Tag className="w-4 h-4 text-green-700 text-3xl" /> ₦{product.sellingPrice.toLocaleString()}
          </span>
        </div>

        {/* Stock Info */}
        <p className={`flex items-center gap-1 text-[clamp(0.65rem,2.5vw,0.75rem)] mt-1 ${product.quantity > 0 ? "text-gray-600" : "text-red-500 font-semibold"}`}>
          <Package className="w-4 h-4" />
          {product.quantity > 0 ? `Available: ${product.quantity}` : "Out of stock"}
        </p>

        {/* Sell Context */}
        {context === "sell" && onSell && (
          <div className="flex flex-col sm:flex-row gap-2 mt-3 items-center">
            <div className="flex border rounded overflow-hidden w-full sm:w-32">
              <button
                className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                onClick={decrement}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={product.quantity}
                value={quantity}
                onChange={(e)=> {
                  const value = Number(e.target.value);
                  if(isNaN(value)) return

                  // Clamp between 1 and stock
                  const safeValue = Math.max(1, Math.min(product.quantity, value))
                  setQuantity(safeValue)
                }}
                
                className="text-center flex-1 px-2 py-1 focus:outline-none"
              />
              <button
                className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                onClick={increment}
              >
                +
              </button>
            </div>
            <button
              className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition w-full sm:w-auto"
              disabled={product.quantity <= 0}
              onClick={() => onSell(product.id, quantity)}
            >
              <ShoppingCart className="w-4 h-4" /> Sell
            </button>
          </div>
        )}

        {/* Admin Context */}
        {context === "admin" && (
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <button
              className="flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded shadow transition w-full sm:w-auto"
              onClick={() => onEdit?.(product)}
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button
              className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow transition w-full sm:w-auto"
              onClick={() => onDelete?.(product.id)}
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}