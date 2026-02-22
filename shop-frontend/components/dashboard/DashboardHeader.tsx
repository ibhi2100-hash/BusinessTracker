"use client";

import { Bell, Plus } from "lucide-react";
import { useBusinessContext } from "@/hooks/useBusinessContext";
import { useBranchStore } from "@/store/useBranchStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { switchBranch } from "@/services/branch.service";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const DashboardHeader = () => {
  const query = useBusinessContext(); // hydrates Zustand
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    businessName,
    branches,
    activeBranchId,
    setActiveBranch,
    role,
  } = useBranchStore();

  

  const [isSwitching, setIsSwitching] = useState(false);

  // Skeleton while context loads
  if (query.isLoading) {
    return (
      <div className="flex items-center justify-between animate-pulse">
        <div className="space-y-2">
          <div className="w-32 h-4 bg-gray-300 rounded"></div>
          <div className="w-48 h-6 bg-gray-300 rounded"></div>
          <div className="w-32 h-4 bg-gray-300 rounded mt-2"></div>
        </div>
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    );
  }

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "add_new") {
      router.push("/branches/new");
      return;
    }

    // prevent duplicate switching
    if (value === activeBranchId || isSwitching) return;

    try {
      setIsSwitching(true);

      // 1️⃣ request new token for selected branch
      const data = await switchBranch(value);
      

      // 2️⃣ update UI state
      setActiveBranch(value);
      useAuthStore.getState().setAccessToken(data.accessToken, data.expiresIn)

      // 3️⃣ clear server cache tied to previous branch
      queryClient.clear();

      // 4️⃣ refresh server components & hooks
      router.refresh();
    } catch (error) {
      console.error("Branch switch failed:", error);

      // optional: show toast notification
      alert("Failed to switch branch. Please try again.");
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      {/* LEFT */}
      <div>
        <p className="text-sm text-gray-500">
          Good Morning
        </p>

        <h1 className="text-xl font-semibold">{businessName}</h1>

        <select
          value={activeBranchId ?? ""}
          onChange={handleChange}
          disabled={isSwitching}
          className="mt-1 text-sm bg-gray-100 rounded-lg px-2 py-1 disabled:opacity-50"
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
              {branch.id === activeBranchId ? " (Active)" : ""}
            </option>
          ))}

          {role === "ADMIN" && (
            <option value="add_new">+ Add Branch</option>
          )}
        </select>

        {isSwitching && (
          <p className="text-xs text-gray-400 mt-1">
            Switching branch…
          </p>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {role === "ADMIN" && (
          <button
            onClick={() => router.push("/branches/new")}
            className="hidden sm:flex items-center gap-1 text-sm font-medium px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Branch
          </button>
        )}

        <button
          className="relative p-2 rounded-full bg-white shadow hover:shadow-md transition"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  );
};