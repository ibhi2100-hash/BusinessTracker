// components/inventory/BrandDropdown.tsx
import { useInventoryStore } from "../../store/inventoryStore";

export default function BrandDropdown() {
  const brands = useInventoryStore((state) => state.brands);
  const selectedBrandId = useInventoryStore(
    (state) => state.selectedBrandId
  );
  const setSelectedBrandId = useInventoryStore(
    (state) => state.setSelectedBrandId
  );

  if (brands.length === 0) return null;

  return (
    <select
      value={selectedBrandId ?? ""}
      onChange={(e) =>
        setSelectedBrandId(e.target.value || null)
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