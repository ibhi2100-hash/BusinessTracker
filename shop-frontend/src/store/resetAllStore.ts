import { useAuthStore } from "./useAuthStore";
import { useBusinessStore } from "./businessStore";
import { useBranchStore } from "./useBranchStore";




export function resetAllStores() {
  useAuthStore.setState({ user: null });
  useBusinessStore.setState({ business: null });
  useBranchStore.setState({
    branches: [],
    activeBranchId: null,
  });

}