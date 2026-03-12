import { Category } from "../../store/inventoryStore";

interface Props {
  category: Category;
  onClick?: () => void;
}

export default function CategoryCard({ category, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="border rounded-xl shadow-md p-4 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all flex flex-col items-center bg-white"
    >
      {category.imageUrl && (
        <img
          src={category.imageUrl}
          alt={category.name}
          className="w-24 h-24 object-cover rounded-full mb-3 border border-gray-200"
        />
      )}
      <span className="font-semibold text-gray-700 text-center">{category.name}</span>
    </div>
  );
}