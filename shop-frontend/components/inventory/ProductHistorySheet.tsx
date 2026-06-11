"use client";

import { ClipboardList } from "lucide-react";

import { GlassSheet } from "../ui/GlassSheet";
import { DataCard } from "../ui/DataCard";

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  quantity?: number;
  amount?: number;
  description?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;

  product: {
    id: string;
    name: string;
  } | null;

  history: HistoryItem[];
}

export default function ProductHistorySheet({
  open,
  onClose,
  product,
  history,
}: Props) {
  if (!open || !product) return null;

  return (
    <GlassSheet
      open={open}
      onClose={onClose}
      title="Product History"
      subtitle={product.name}
    >
      <div className="space-y-3">

        {history.length === 0 && (
          <div className="text-center py-10 opacity-60">
            No activity found
          </div>
        )}

        {history.map((item) => (
          <DataCard
            key={item.id}
            title={item.title}
            subtitle={item.date}
            badge={
              <ClipboardList size={18} />
            }
            metrics={[
              {
                label: "Quantity",
                value:
                  item.quantity ?? "-"
              },
              {
                label: "Amount",
                value:
                  item.amount
                    ? `₦${item.amount.toLocaleString()}`
                    : "-"
              },
            ]}
          />
        ))}

      </div>
    </GlassSheet>
  );
}