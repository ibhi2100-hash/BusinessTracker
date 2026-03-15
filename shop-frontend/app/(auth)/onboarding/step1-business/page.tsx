"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "../../../../components/onboarding/StepHeader";
import { StepFooter } from "../../../../components/onboarding/StepFooter";
import { createBusiness } from "@/offline/business/createBusiness";


export default function Step2Business() {
  const router = useRouter();
 // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const branchData = {
    name: "Main Branch",

  };

  const businessData = {
    name,
    address
  }
  // Submit handler
  const handleNext = async () => {
    setLoading(true);
    setError("");
    try {
     createBusiness(businessData, branchData)
    
      router.push("/onboard");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <StepHeader step={2} title="Setup Your Business" />
      <div className="space-y-4">
        <input
          className="input"
          placeholder="Business Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Address (Optional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <StepFooter onNext={handleNext} loading={loading} />
    </div>
  );
}