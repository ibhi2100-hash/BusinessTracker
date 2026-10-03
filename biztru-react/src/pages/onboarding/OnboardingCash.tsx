// app/onboard/opening-cash/page.tsx

import{ useNavigate } from "react-router-dom";
import { SetupProgressTracker } from "../../components/business-onboarding/SetupProgressTracker"; 
import CashflowTable from "../../components/capital/capitalPage";
import { StepFooter } from "../../components/business-onboarding/StepFooter"; 


export default function OpeningCashPage() {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/onboarding");
  };

  return (
    <div className="space-y-6">
      <SetupProgressTracker />
      <CashflowTable
        mode="OPENING"
        action= "INJECT"
        onCompleted={()=> console.log("Am completed")}
      />
      <StepFooter
        onNext={handleNext}
        disabled={false}
      />
    </div>
  );
}