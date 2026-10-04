
import type { inventoryProduct } from "../../../Biztru/store/inventoryStore";
import { DataCard } from "../../ui/DataCard"; 
import { StockBadge } from "../../ui/StockBadge"; 
import { GlassButton } from "../../ui/GlassButton"; 
import type { LiveProduct } from "../../../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository"; 

interface Props {
  product: LiveProduct;
  context: "sell" | "admin";
  onSell?: (productId: string, quantity: number) => void;
  onManage?: (product: LiveProduct) => void;
  onDelete?: (productId: string) => void;
  onOpenQuantityModal?: (product: inventoryProduct) => void;
}

export default function ProductCard({
  product,
  onManage,
  onDelete,
}: Props) {


  return (
   
      <DataCard
      title={product.name}
      subtitle={product.category}
      badge={
        <StockBadge quantity={product.quantity} />
      }
      metrics={[
        {
          label: "Selling",
          value: `₦${product.price.toLocaleString()}`
        },
        {
          label: "Stock",
          value: product.quantity
        },
        {
          label: "Cost",
          value: `₦${product.costPrice.toLocaleString()}`
        },
        {
          label: "Margin",
          value: `₦${(
            product.price -
            product.costPrice
          ).toLocaleString()}`
        }
      ]}
      actions={
        <>
          <GlassButton
            variant="secondary"
            onClick={() => onManage?.(product)}
          >
            Manage
          </GlassButton>

          <GlassButton
            variant="danger"
            onClick={() => onDelete?.(product.id)}
          >
            Delete
          </GlassButton>
        </>
      }
    />
  );
}