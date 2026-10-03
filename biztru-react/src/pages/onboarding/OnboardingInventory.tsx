

import { SetupProgressTracker } from "../../components/business-onboarding/SetupProgressTracker"; 
import InventoryPage from "../../components/inventory/inventoryPage";
import { StepFooter } from "../../components/business-onboarding/StepFooter"; 
import { useNavigate } from "react-router-dom";


export default function OnboardingInventoryPage() {
  const navigate = useNavigate()
  
  const handleNext = () => {
   
    navigate("/onboarding-opening-cash")};
  return (
    <div>
        <SetupProgressTracker />
        <InventoryPage context="admin" mode="OPENING" />
        <StepFooter onNext={handleNext} disabled={false} />
      
    </div>
  
  );
}