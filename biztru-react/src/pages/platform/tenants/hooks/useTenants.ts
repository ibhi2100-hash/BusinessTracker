
import { useMemo, useState } from "react";

import { tenantsMock } from "../data/tenants.mock";

import type {
  Tenant,
  TenantFilters,
  TenantStatus,
} from "../types/tenant.types";

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>(
    tenantsMock,
  );

  const [filters, setFilters] = useState<TenantFilters>({
    search: "",
    status: "ALL",
    industry: "ALL",
    plan: "ALL",
  });

  const [selectedTenant, setSelectedTenant] =
    useState<Tenant | null>(null);

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const query = filters.search.toLowerCase();

      const matchesSearch =
        tenant.businessName.toLowerCase().includes(query) ||
        tenant.businessCode.toLowerCase().includes(query) ||
        tenant.ownerEmail.toLowerCase().includes(query);

      const matchesStatus =
        filters.status === "ALL" ||
        tenant.status === filters.status;

      const matchesIndustry =
        filters.industry === "ALL" ||
        tenant.industry === filters.industry;

      const matchesPlan =
        filters.plan === "ALL" ||
        tenant.planName === filters.plan;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesIndustry &&
        matchesPlan
      );
    });
  }, [tenants, filters]);

  const updateStatus = (
    tenantId: string,
    status: TenantStatus,
  ) => {
    setTenants((current) =>
      current.map((tenant) =>
        tenant.id === tenantId
          ? { ...tenant, status }
          : tenant,
      ),
    );

    setSelectedTenant((current) =>
      current?.id === tenantId
        ? { ...current, status }
        : current,
    );
  };

  return {
    tenants,
    filteredTenants,
    filters,
    setFilters,
    selectedTenant,
    setSelectedTenant,
    updateStatus,
  };
}
