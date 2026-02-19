// components/inventory/BrandDropdown.tsx
import { useInventoryStore } from "../../store/inventoryStore";

export default function BrandDropdown() {
  const brands = useInventoryStore(state => state.brands);
  const selectedBrand = useInventoryStore(state => state.selectedBrand);
  const setSelectedBrand = useInventoryStore(state => state.setSelectedBrand);

  if (brands.length === 0) return null;

  return (
    <select
      value={selectedBrand?.id || ""}
      onChange={(e) =>
        setSelectedBrand(brands.find((b) => b.id === e.target.value))
      }
      className="border p-2 rounded mb-4"
    >
      <option value="">Select Brand</option>
      {brands.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );
}
