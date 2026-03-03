// components/dashboard/financial-quick-actions.tsx
"use client";

import { Button } from "@/components/ui/button";

interface Props {
  onClose: () => void;
  onViewDetails: () => void;
  onExport?: () => void;
}

export const FinancialQuickActions = ({
  onClose,
  onViewDetails,
  onExport,
}: Props) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">
      <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
        <Button fullWidth onClick={onViewDetails}>
          View Details
        </Button>

        {onExport && (
          <Button variant="secondary" fullWidth onClick={onExport}>
            Export Data
          </Button>
        )}

        <Button variant="ghost" fullWidth onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};