"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { eventService } from "@/src/services/eventService";
import { nanoid } from "nanoid";
import { AggregateType } from "@/offline/domain/aggregate";
import { BusinessEventTypes } from "@/offline/core/events/eventGroups/businessEvents";


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
    const businessId = nanoid();
    const branchId = nanoid();

    if (loading) return;

    setLoading(true);
    setError("");

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
          name: form.name,
          address: form.address,
        }
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
          phone: ""
        }
      });

      router.replace("/onboard");
    } catch (err: any) {
      setError(err?.message ?? "Failed to create business");
      throw new Error(err)
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col justify-between py-8">

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="mb-10">
          <div className="
            w-14 h-14
            rounded-[20px]
            bg-white/10
            backdrop-blur-xl
            border border-white/10
            flex items-center justify-center
            shadow-2xl
          ">
            <Sparkles className="text-white" size={22} />
          </div>
        </div>

        {/* HERO */}
        <div className="space-y-4 mb-10">

          <div className="
            inline-flex items-center gap-2
            px-3 py-1.5
            rounded-full
            bg-white/5
            border border-white/10
            backdrop-blur-md
          ">
            <div className="w-2 h-2 bg-green-400 rounded-full" />

            <span className="text-white/70 text-sm">
              Business onboarding
            </span>
          </div>

          <h1 className="
            text-[42px]
            leading-[1]
            tracking-[-0.04em]
            font-semibold
            text-white
          ">
            Create your
            <br />
            business
          </h1>

          <p className="
            text-white/50
            text-[17px]
            leading-relaxed
            max-w-[320px]
          ">
            Set up your workspace and start managing inventory,
            sales and analytics instantly.
          </p>
        </div>

        {/* GLASS FORM */}
        <div className="
          rounded-[32px]
          border border-white/10
          bg-white/5
          backdrop-blur-2xl
          shadow-[0_8px_40px_rgba(0,0,0,0.45)]
          p-5
          space-y-4
        ">

          {/* INPUT */}
          <div className="
            rounded-2xl
            bg-white/5
            border border-white/10
            px-4 py-4
            flex items-center gap-3
          ">
            <Building2
              size={18}
              className="text-white/40"
            />

            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Business name"
              className="
                bg-transparent
                outline-none
                text-white
                placeholder:text-white/30
                w-full
                text-[16px]
              "
            />
          </div>

          {/* INPUT */}
          <div className="
            rounded-2xl
            bg-white/5
            border border-white/10
            px-4 py-4
            flex items-center gap-3
          ">
            <MapPin
              size={18}
              className="text-white/40"
            />

            <input
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Business address"
              className="
                bg-transparent
                outline-none
                text-white
                placeholder:text-white/30
                w-full
                text-[16px]
              "
            />
          </div>
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div className="space-y-4">

        <button
          disabled={loading}
          onClick={handleNext}
          className="
            h-14
            rounded-2xl
            w-full
            bg-white
            text-black
            font-medium
            flex items-center justify-center gap-2
            active:scale-[0.985]
            transition-all
          "
        >
          Continue
          <ArrowRight size={18} />
        </button>

        <p className="text-center text-white/30 text-sm">
          Secure local-first business setup
        </p>
      </div>
    </div>
  );
}