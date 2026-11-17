import { Navigate, useParams } from "react-router-dom";

import InventoryPage from "../../components/inventory/inventoryPage";
/**
 * CEO / ADMIN branch inventory page.
 *
 * The branchId comes from the URL, not from the operational
 * BusinessContext. This allows the owner to inspect or manage
 * a selected branch without changing their active branch.
 */
export default function OwnerBranchSalesPage() {
  const { branchId } = useParams<{ branchId: string }>();

  if (!branchId) {
    return <Navigate to="/owner-dashboard" replace />;
  }

  return (
    <InventoryPage
      context="sell"     
      mode="LIVE"
      branchId={branchId}
    />
  );
}