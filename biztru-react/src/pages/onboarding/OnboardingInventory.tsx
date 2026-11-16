import { SetupProgressTracker } from "../../components/business-onboarding/SetupProgressTracker";
import InventoryPage from "../../components/inventory/inventoryPage";
import { StepFooter } from "../../components/business-onboarding/StepFooter";
import { useNavigate } from "react-router-dom";
import { useBusinessContext } from "../../Biztru/context/BusinessContext";


export default function OnboardingInventoryPage() {
  const navigate = useNavigate();

  const {
    businessId,
    branchId,
  } = useBusinessContext();

  const safeBusinessId = businessId ?? undefined;
  const safeBranchId = branchId ?? undefined;

  const handleNext = () => {
    navigate("/onboarding-opening-cash");
  };

  if (!safeBusinessId || !safeBranchId) {
    return (
      <div className="p-6">
        Branch setup information is missing. Complete business and branch
        creation before initializing inventory.
      </div>
    );
  }

  return (
    <div>
      <SetupProgressTracker />

      <InventoryPage
        context="admin"
        mode="OPENING"
        businessId={safeBusinessId}
        branchId={safeBranchId}
      />

      <StepFooter
        onNext={handleNext}
        disabled={false}
      />
    </div>
  );
}