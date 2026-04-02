import { useAuthStore } from "./useAuthStore";
import { useBusinessStore } from "./businessStore";
import { useBranchStore } from "./useBranchStore";
import { useInventoryStore } from "./inventoryStore";
import { useFinancialStore } from "./financialDataStore";


export function resetAllStores() {
  useAuthStore.setState({ user: null });
  useBusinessStore.setState({ business: null });
  useBranchStore.setState({
    branches: [],
    activeBranchId: null,
  });
  useInventoryStore.setState({ products: [] });
  useFinancialStore.setState({ ledger: [] });
}