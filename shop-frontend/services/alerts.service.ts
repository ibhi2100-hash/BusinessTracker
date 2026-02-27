

export const getBranchAlerts = async (branchId: string )=> {

const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/business/alerts/${branchId}`,
    {
      credentials: "include",
    }
  );

  if (!res.ok) throw new Error("Failed to switch branch");

  return res.json(); 
}