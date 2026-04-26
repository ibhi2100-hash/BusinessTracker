"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BusinessService } from "@/src/services/businessService";
import { useBusinessStore } from "@/src/store/businessStore";

import {
  Building2,
  MapPin,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function Step2Business() {
  const router = useRouter();
  const business = useBusinessStore((s) => s.business);

  const [form, setForm] = useState({
    name: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const waitForBusinessHydration = (timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const start = Date.now();

      const check = setInterval(() => {
        const current = useBusinessStore.getState().business;

        if (current) {
          clearInterval(check);
          resolve(current);
        }

        if (Date.now() - start > timeout) {
          clearInterval(check);
          reject(new Error("Business hydration timeout"));
        }
      }, 50);
    });
  };

  const handleNext = async () => {
    if (!form.name.trim()) {
      setError("Business name is required");
      return;
    }

    if (loading) return;

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

      await waitForBusinessHydration();

      router.replace("/onboard");
    } catch (err: any) {
      setError(err?.message ?? "Failed to create business");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 flex items-center justify-center px-4">
      
      {/* CARD */}
      <div className="w-full max-w-md rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl border border-gray-200 p-6 space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
              <Sparkles size={20} />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">
            Set up your business
          </h1>

          <p className="text-sm text-gray-500">
            Create your workspace to start managing inventory
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          {/* BUSINESS NAME */}
          <div className="relative">
            <Building2 className="absolute left-3 top-3.5 text-gray-400" size={18} />

            <input
              className="w-full pl-10 pr-3 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
              placeholder="Business Name"
              value={form.name}
              autoFocus
              onChange={(e) => updateField("name", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* ADDRESS */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />

            <input
              className="w-full pl-10 pr-3 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
              placeholder="Address (optional)"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              disabled={loading}
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl p-2">
              {error}
            </div>
          )}
        </div>

        {/* CTA BUTTON */}
        <button
          onClick={handleNext}
          disabled={loading}
          className="
            w-full flex items-center justify-center gap-2
            bg-black text-white py-3 rounded-xl
            font-medium active:scale-[0.98]
            transition hover:bg-gray-900
          "
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Creating...
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* FOOT NOTE */}
        <p className="text-center text-xs text-gray-400">
          Your data is stored locally and synced securely
        </p>
      </div>
    </div>
  );
}