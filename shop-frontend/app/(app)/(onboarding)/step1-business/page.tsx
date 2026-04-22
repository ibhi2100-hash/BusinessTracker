"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "../../../../components/onboarding/StepHeader";
import { StepFooter } from "../../../../components/onboarding/StepFooter";
import { BusinessService } from "@/src/services/businessService";

export default function Step2Business() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    if (!form.name.trim()) {
      setError("Business name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await BusinessService.createBusiness(
        {
          name: form.name.trim(),
          address: form.address?.trim() || null,
        },
        {
          name: "Main Branch",
        }
      );

      router.replace("/onboard");
    } catch (err: any) {
      setError(err?.message ?? "Failed to create business");
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
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
        />

        <input
          className="input"
          placeholder="Address (Optional)"
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <StepFooter onNext={handleNext} loading={loading} />
    </div>
  );
}