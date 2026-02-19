import { useBranchStore } from "@/store/useBranchStore";

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const branchId = useBranchStore.getState().activeBranchId;

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-branch-id": branchId ?? "",
      ...(options.headers || {}),
    },
    credentials: "include",
  });
};
