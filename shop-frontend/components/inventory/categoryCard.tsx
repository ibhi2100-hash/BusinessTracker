// components/CategoryCard.tsx
import { Category } from "../../store/inventoryStore";
import { useInventoryStore } from "../../store/inventoryStore";

interface Props {
  category: Category;
}

export default function CategoryCard({ category }: Props) {
  const setSelectedCategory = useInventoryStore((state) => state.setSelectedCategory);

  return (
    <div
      className="border rounded-lg shadow p-4 cursor-pointer hover:shadow-lg flex flex-col items-center"
      onClick={() => setSelectedCategory(category)}
    >
      {category.imageUrl && (
        <img src={category.imageUrl} alt={category.name} className="w-20 h-20 object-cover rounded-full mb-2" />
      )}
      <span className="font-semibold">{category.name}</span>
    </div>
  );
}
