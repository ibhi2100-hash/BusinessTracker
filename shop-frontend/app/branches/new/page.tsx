// app/branches/new/page.tsx
"use client";

import { useState } from "react";
import { useAddBranch } from "@/hooks/useAddBranch";
import { useBranchStore } from "@/store/useBranchStore";

export default function AddBranchPage() {
  const [branchName, setBranchName] = useState("");
  const addBranchMutation = useAddBranch();
  const branches = useBranchStore((s) => s.branches);
  console.log(branches)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return;

    try {
      await addBranchMutation.mutateAsync(branchName);
      setBranchName(""); // reset form after successful add
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Add Branch</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Branch Name"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          className="border p-2 flex-1 rounded"
        />
        <button
          type="submit"
          disabled={addBranchMutation.isLoading}
          className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {addBranchMutation.isLoading ? "Adding..." : "Add"}
        </button>
      </form>

      {addBranchMutation.isError && (
        <p className="text-red-500 mt-2">
          Failed to add branch. Please try again.
        </p>
      )}

      <h2 className="font-semibold mb-2">Existing Branches</h2>
      <ul>
        {branches.map((b) => (
          <li key={b.id} className="border p-2 rounded mb-1">
            {b.name} {b.id === useBranchStore.getState().activeBranchId && "(Active)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
