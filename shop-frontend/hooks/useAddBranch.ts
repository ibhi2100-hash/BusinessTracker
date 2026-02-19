import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBranchStore } from "@/store/useBranchStore";

export const useAddBranch = ()=> {
    const queryClient = useQueryClient();
    const setContext = useBranchStore((s)=> s.setContext);

    return useMutation({
        mutationFn: async (name: string) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/create`,{
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ name }),
            }
            );
            if(!res.ok) throw new Error(" Failed to add branch");
            return res.json();
        },
        onSuccess: (newBranch)=> {
            // updata Zustand store
            useBranchStore.setState((state) => ({
                branches: [...state.branches, newBranch],
                activeBranchId: newBranch.id,
            }));

            //optional: update React Query cach for business context
            queryClient.invalidateQueries({ queryKey: ["business-context"]});
        }
    })
}