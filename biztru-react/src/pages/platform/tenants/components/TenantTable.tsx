
import {
  Eye,
  MoreHorizontal,
  Building2,
  Users,
} from "lucide-react";

import { GlassCard } from "../../../../components/ui/GlassCard"; 

import type { Tenant } from "../types/tenant.types";
import { TenantStatusBadge } from "./TenantStatusBadge";

interface Props {
  tenants: Tenant[];
  onSelect: (tenant: Tenant) => void;
}

export function TenantTable({ tenants, onSelect }: Props) {
  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
        <div>
          <h3 className="font-semibold text-white">
            Business Registry
          </h3>
          <p className="mt-1 text-xs text-white/40">
            Registered businesses across BizTru
          </p>
        </div>

        <span className="text-xs text-white/40">
          {tenants.length} results
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs text-white/40">
              <th className="px-5 py-4 font-medium">Business</th>
              <th className="px-5 py-4 font-medium">Owner</th>
              <th className="px-5 py-4 font-medium">Plan</th>
              <th className="px-5 py-4 font-medium">Branches</th>
              <th className="px-5 py-4 font-medium">Employees</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {tenants.map((tenant) => (
              <tr
                key={tenant.id}
                className="border-b border-white/[0.04] transition hover:bg-white/[0.025]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/10 text-teal-400">
                      <Building2 size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {tenant.businessName}
                      </p>
                      <p className="mt-1 text-[10px] text-white/35">
                        {tenant.businessCode}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-white/80">
                    {tenant.ownerName}
                  </p>
                  <p className="mt-1 text-xs text-white/35">
                    {tenant.ownerEmail}
                  </p>
                </td>

                <td className="px-5 py-4 text-sm text-white/70">
                  {tenant.planName}
                </td>

                <td className="px-5 py-4 text-sm text-white/70">
                  {tenant.branchCount}
                </td>

                <td className="px-5 py-4 text-sm text-white/70">
                  <span className="flex items-center gap-2">
                    <Users size={14} />
                    {tenant.employeeCount}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <TenantStatusBadge status={tenant.status} />
                </td>

                <td className="px-5 py-4">
                  <button
                    onClick={() => onSelect(tenant)}
                    className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-teal-400"
                    aria-label={`View ${tenant.businessName}`}
                  >
                    <Eye size={17} />
                  </button>
                </td>
              </tr>
            ))}

            {tenants.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-white/40"
                >
                  No businesses match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
