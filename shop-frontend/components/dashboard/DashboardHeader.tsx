"use client";

import { Bell, Plus } from "lucide-react";
import { useBusinessContext } from "@/hooks/useBusinessContext";
import { useBranchStore } from "@/store/useBranchStore";
import { useRouter } from "next/navigation";

export const DashboardHeader = () => {
  const query = useBusinessContext(); // hydrates the store
  const router = useRouter();

  const { businessName, branches, activeBranchId, setActiveBranch, role } =
    useBranchStore();

  // Don't render until store is hydrated
  if (query.isLoading){
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
  } // or return a skeleton loader

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "add_new") {
      router.push("/branches/new");
      return;
    }
    setActiveBranch(e.target.value);
  };

  return (
    <div className="flex items-center justify-between">
      {/* LEFT */}
      <div>
        <p className="text-sm text-gray-500">Good Morning</p>
        <h1 className="text-xl font-semibold">{businessName}</h1>

        <select
          value={activeBranchId ?? ""}
          onChange={handleChange}
          className="mt-1 text-sm bg-gray-100 rounded-lg px-2 py-1"
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
              {branch.id === activeBranchId ? " (Active)" : ""}
            </option>
          ))}

          {role === "ADMIN" && <option value="add_new">+ Add Branch</option>}
        </select>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {role === "ADMIN" && (
          <button
            onClick={() => router.push("/branches/new")}
            className="hidden sm:flex items-center gap-1 text-sm font-medium px-3 py-2 bg-blue-600 text-white rounded-lg"
          >
            <Plus size={16} />
            Branch
          </button>
        )}

        <button className="relative p-2 rounded-full bg-white shadow">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  );
};