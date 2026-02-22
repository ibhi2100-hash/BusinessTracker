// services/branch.service.ts
export async function switchBranch(branchId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/business/switch-branch`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId }),
    }
  );

  if (!res.ok) throw new Error("Failed to switch branch");

  return res.json();
}