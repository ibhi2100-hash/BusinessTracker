"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "../../../../components/onboarding/StepHeader";
import { StepFooter } from "../../../../components/onboarding/StepFooter";
import { useBranchStore } from "@/store/useBranchStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStatus } from "@/hooks/useBusinessStatus";
import { useBusinessStore } from "@/store/businessStore";

export default function Step2Business() {
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Stores
  const setLogin = useAuthStore((state) => state.setLogin);
  const businessFromStore = useBusinessStore((state) => state.business);
  const setBusiness = useBusinessStore((state) => state.setBusiness);

  // Fetch business status
  const { data, isLoading: statusLoading } = useBusinessStatus();

  // Update store when data arrives
  useEffect(() => {
    if (data && !businessFromStore) {
      setBusiness(data);
    }
  }, [data, businessFromStore, setBusiness]);

  // Redirect if already onboarding
  useEffect(() => {
    
  }, [businessFromStore, router]);

  // Submit handler
  const handleNext = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/onboarding/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name, address }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create business");
      }

      const result = await res.json();
      const branch = result.firstBranch;

      // Hydrate Branch store
      useBranchStore.getState().setContext({
        businessName: branch.business.name,
        branches: [branch],
        role: "ADMIN",
        activeBranchId: branch.id,
      });

      // Update Auth store
      if (result.token && result.expiresIn) {
        setLogin(
          useAuthStore.getState().user!,
          result.accessToken,
          result.expiresIn,
          [branch],
          branch
        );

      }
    
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