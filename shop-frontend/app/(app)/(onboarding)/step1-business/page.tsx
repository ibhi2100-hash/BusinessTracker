"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  MapPin,
  Sparkles,
  Loader2,
} from "lucide-react";

import { eventService } from "@/src/services/eventService";
import { nanoid } from "nanoid";
import { AggregateType } from "@/offline/domain/aggregate";
import { BusinessEventTypes } from "@business/shared-types";
import { GlassButton } from "@/components/ui/GlassButton";

export default function Step2Business() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    if (loading) return;

    if (!form.name.trim()) {
      setError("Business name is required");
      return;
    }

    setLoading(true);
    setError(null);

    const businessId = nanoid();
    const branchId = nanoid();

    try {
      await eventService.create({
        type: BusinessEventTypes.BUSINESS_CREATED,
        aggregateType: AggregateType.BUSINESS,
        aggregateId: businessId,
        businessId: null,
        branchId: null,
        mode: "OPENING",
        payload: {
          id: businessId,
          name: form.name.trim(),
          address: form.address.trim(),
        },
      });

      await eventService.create({
        type: BusinessEventTypes.BRANCH_CREATED,
        aggregateType: AggregateType.BRANCH,
        aggregateId: branchId,
        businessId,
        branchId: null,
        mode: "OPENING",
        payload: {
          id: branchId,
          businessId,
          name: "Main Branch",
          phone: "",
        },
      });

      router.replace("/onboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create business";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4 max-w-md mx-auto flex flex-col justify-between h-screen">
      {/* TOP SECTION */}
      <div>
        {/* ICON */}
        <div className="mb-10">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur">
            <Sparkles className="text-white" size={22} />
          </div>
        </div>

        {/* HERO */}
        <div className="space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-white/60 text-sm">
              Business onboarding
            </span>
          </div>

          <h1 className="text-[40px] leading-[1.05] font-semibold tracking-tight">
            Create your
            <br />
            business
          </h1>

          <p className="text-white/50 text-[16px] max-w-sm">
            Set up your workspace to manage inventory, sales and financial
            activity in one system.
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          {/* ERROR */}
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* BUSINESS NAME */}
          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/5 border border-white/10">
            <Building2 size={18} className="text-white/40" />

            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Business name"
              className="w-full bg-transparent outline-none text-white placeholder:text-white/30"
            />
          </div>

          {/* ADDRESS */}
          <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white/5 border border-white/10">
            <MapPin size={18} className="text-white/40" />

            <input
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Business address (optional)"
              className="w-full bg-transparent outline-none text-white placeholder:text-white/30"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div className="space-y-4">
        <GlassButton 
          variant="primary"
          disabled={loading}
          onClick={handleNext}
          className="w-full h-14 rounded-2xl font-medium flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Continue 
                <ArrowRight size={18} />
              </>
            )}
        </GlassButton>
        
      

        <p className="text-center text-white/30 text-sm">
          Secure local-first business setup
        </p>
        </div>
      <div/>
    </div>
    
  );
}