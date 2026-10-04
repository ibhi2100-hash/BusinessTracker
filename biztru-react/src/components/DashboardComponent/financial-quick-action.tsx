import { GlassButton } from "../ui/GlassButton";
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
        <GlassButton  onClick={onViewDetails}>
          View Details
        </GlassButton>

        {onExport && (
          <GlassButton variant="secondary"  onClick={onExport}>
            Export Data
          </GlassButton>
        )}

        <GlassButton variant="tertiary" onClick={onClose}>
          Cancel
        </GlassButton>
      </div>
    </div>
  );
}
