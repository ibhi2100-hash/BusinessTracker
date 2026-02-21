'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "../../../../components/onboarding/StepHeader";
import { StepFooter } from "../../../../components/onboarding/StepFooter";
import { useBranchStore } from "@/store/useBranchStore";



export default function Step2Business() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    setLoading(true);
    setError("");
try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/onboarding/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, address }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create business");
  }

  // Get created business data from response
  const data = await res.json();
  //HYDRATE THE STORE BEFORE NAVIGATING
  const branch = data.firstBranch;

  useBranchStore.getState().setContext({
    businessName: branch.business.name,
    branches: [branch],
    role: "ADMIN",
    activeBranchId: branch.id
  })
  router.push("/dashboard");
} catch (err: any) {
  setError(err.message);
} finally {
  setLoading(false);
}


}
  return (
    <div className="p-4 max-w-md mx-auto">
      <StepHeader step={2} title="Setup Your Business" />
      <div className="space-y-4">
        <input className="input" placeholder="Business Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="input" placeholder="Address (Optional)" value={address} onChange={e => setAddress(e.target.value)} />
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <StepFooter onNext={handleNext} loading={loading} />
    </div>
  );
}
