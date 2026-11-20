
import { useTenants } from "./hooks/useTenants";

import { TenantTable } from "./components/TenantTable";
import { TenantDetailsSheet } from "./components/TenantDetailsSheet";

import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassInput } from "../../../components/ui/GlassInput";

export default function TenantManagementPage() {
  const {
    tenants,
    filteredTenants,
    filters,
    setFilters,
    selectedTenant,
    setSelectedTenant,
    updateStatus,
  } = useTenants();

  const metrics = [
    {
      label: "Total Businesses",
      value: tenants.length,
    },
    {
      label: "Active",
      value: tenants.filter((t) => t.status === "ACTIVE").length,
    },
    {
      label: "Trials",
      value: tenants.filter((t) => t.status === "TRIAL").length,
    },
    {
      label: "Suspended",
      value: tenants.filter((t) => t.status === "SUSPENDED").length,
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-400">
          Platform Management
        </p>

        <h1 className="mt-2 text-2xl font-bold text-white">
          Tenant Management
        </h1>

        <p className="mt-1 text-sm text-white/45">
          Manage registered businesses and their platform access.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map((metric) => (
          <GlassCard key={metric.label} className="p-4">
            <p className="text-xs text-white/45">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {metric.value.toLocaleString()}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <GlassInput
            placeholder="Search business, code or owner..."
            value={filters.search}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                search: value.target.value,
              }))
            }
          />

          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value as typeof filters.status,
              }))
            }
            className="rounded-xl border border-white/10 bg-[#17212E] px-3 py-2 text-sm text-white outline-none"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Trial</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={filters.plan}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                plan: event.target.value,
              }))
            }
            className="rounded-xl border border-white/10 bg-[#17212E] px-3 py-2 text-sm text-white outline-none"
          >
            <option value="ALL">All plans</option>
            <option value="Starter">Starter</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
      </GlassCard>

      <TenantTable
        tenants={filteredTenants}
        onSelect={setSelectedTenant}
      />

      <TenantDetailsSheet
        tenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
        onStatusChange={updateStatus}
      />
    </div>
  );
}
