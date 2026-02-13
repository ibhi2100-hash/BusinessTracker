'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "../../../../components/onboarding/StepHeader";
import { StepFooter } from "../../../../components/onboarding/StepFooter";

interface Branch {
  name: string;
  address?: string;
  phone?: string;
}

export default function Step3Branches() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const addBranch = () => {
    if (!branchName) return;
    setBranches([...branches, { name: branchName, address: branchAddress, phone: branchPhone }]);
    setBranchName("");
    setBranchAddress("");
    setBranchPhone("");
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      // Save branches to backend
      await fetch("/api/branches/create-many", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branches }),
      });
      router.push("/onboarding/step4-products");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <StepHeader step={3} title="Add Your Branches" />
      
      <div className="space-y-4">
        <input placeholder="Branch Name" className="input" value={branchName} onChange={e => setBranchName(e.target.value)} />
        <input placeholder="Branch Address" className="input" value={branchAddress} onChange={e => setBranchAddress(e.target.value)} />
        <input placeholder="Branch Phone" className="input" value={branchPhone} onChange={e => setBranchPhone(e.target.value)} />
        <button type="button" className="btn-primary w-full" onClick={addBranch}>Add Branch</button>
      </div>

      {branches.length > 0 && (
        <div className="mt-4">
          {branches.map((b, idx) => (
            <div key={idx} className="p-2 border rounded mb-2">
              <p><strong>{b.name}</strong></p>
              <p>{b.address}</p>
              <p>{b.phone}</p>
            </div>
          ))}
        </div>
      )}

      <StepFooter onNext={handleNext} loading={loading} />
    </div>
  );
}
