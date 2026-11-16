
import { useCallback } from "react";
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "../useLiveQuery";

export function useLiveBusinessData(
  businessId: string | null | undefined
) {
  const app = useApplication();

  const query = useCallback(async () => {
    if (!businessId) return null;

    const [
      profile,
      branches,
      products,
      inventory,
      employees,
      customers,
      suppliers,
      sales,
      ledger,
      expenses,
    ] = await Promise.all([
      app.businessDashboard.getProfile(businessId),
      app.businessDashboard.getBranches(businessId),
      app.businessDashboard.getProducts(businessId),
      app.businessDashboard.getAllInventory(businessId),
      app.businessDashboard.getEmployees(businessId),
      app.businessDashboard.getCustomers(businessId),
      app.businessDashboard.getSuppliers(businessId),
      app.businessDashboard.getSales(businessId),
      app.businessDashboard.getLedger(businessId),
      app.businessDashboard.getAllExpenses(businessId),
    ]);

    return {
      profile,
      branches,
      products,
      inventory,
      employees,
      customers,
      suppliers,
      sales,
      ledger,
      expenses,
    };
  }, [app, businessId]);

  return useLiveQuery(
    [
      "businesses",
      "branches",
      "products",
      "branch_inventory",
      "employees",
      "customers",
      "suppliers",
      "sales",
      "ledger",
      "expenses",
    ],
    query,
    null
  );
}
