'use client';
import { useRouter } from "next/navigation";
import { StepHeader } from "../../../../components/onboarding/StepHeader";
import { StepFooter } from "../../../../components/onboarding/StepFooter";
import { useState } from "react";

export default function Step2Plan() {
  const router = useRouter();
  const [businessType, setBusinessType] = useState('');
  const [expectedSales, setExpectedSales] = useState<number | null>(null);
  const [branchCount, setBranchCount] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      await fetch("/api/onboarding/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType,
          expectedSales,
          branchCount,
          paymentMethods,
        }),
      });
      router.push("/onboarding/step3"); // Branch info
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentMethod = (method: string) => {
    setPaymentMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <StepHeader step={2} title="Business Plan" />

      <div className="space-y-4">
        <div className="card p-3">
          <label className="font-semibold">Business Type</label>
          <select
            value={businessType}
            onChange={e => setBusinessType(e.target.value)}
            className="mt-1 w-full border p-2 rounded"
          >
            <option value="">Select type</option>
            <option value="RETAIL">Retail</option>
            <option value="MOBILE_PHONE">Mobile Phone</option>
            <option value="ELECTRONICS">Electronics</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="card p-3">
          <label className="font-semibold">Expected Monthly Sales (₦)</label>
          <input
            type="number"
            value={expectedSales ?? ''}
            onChange={e => setExpectedSales(Number(e.target.value))}
            className="mt-1 w-full border p-2 rounded"
          />
        </div>

        <div className="card p-3">
          <label className="font-semibold">Number of Branches</label>
          <input
            type="number"
            value={branchCount ?? ''}
            onChange={e => setBranchCount(Number(e.target.value))}
            className="mt-1 w-full border p-2 rounded"
          />
        </div>

        <div className="card p-3">
          <label className="font-semibold">Payment Methods Accepted</label>
          <div className="flex space-x-2 mt-1">
            {["CASH", "POS", "TRANSFER"].map((method) => (
              <button
                key={method}
                className={`px-3 py-1 rounded border ${
                  paymentMethods.includes(method) ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() => togglePaymentMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
      </div>

      <StepFooter onNext={handleNext} loading={loading} nextText="Next" />
    </div>
  );
}
