
import {
  Building2,
  Mail,
  Phone,
  Users,
  Package,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { GlassSheet } from "../../../../components/ui/GlassSheet";
import { GlassCard } from "../../../../components/ui/GlassCard";
import { GlassButton } from "../../../../components/ui/GlassButton";

import type {
  Tenant,
  TenantStatus,
} from "../types/tenant.types";

import { TenantStatusBadge } from "./TenantStatusBadge";

interface Props {
  tenant: Tenant | null;
  onClose: () => void;
  onStatusChange: (
    id: string,
    status: TenantStatus,
  ) => void;
}

export function TenantDetailsSheet({
  tenant,
  onClose,
  onStatusChange,
}: Props) {
  if (!tenant) return null;

  return (
    <GlassSheet
      open={!!tenant}
      onClose={onClose}
      title="Business Details"
    >
      <div className="space-y-5">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/10 text-teal-400">
              <Building2 size={23} />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                {tenant.businessName}
              </h3>
              <p className="mt-1 text-xs text-white/40">
                {tenant.businessCode}
              </p>
              <div className="mt-2">
                <TenantStatusBadge status={tenant.status} />
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "Branches",
              value: tenant.branchCount,
              icon: Building2,
            },
            {
              label: "Employees",
              value: tenant.employeeCount,
              icon: Users,
            },
            {
              label: "Products",
              value: tenant.productCount,
              icon: Package,
            },
          ].map((metric) => (
            <GlassCard
              key={metric.label}
              className="p-3"
            >
              <metric.icon size={16} className="text-teal-400" />
              <p className="mt-3 text-xl font-bold text-white">
                {metric.value.toLocaleString()}
              </p>
              <p className="text-[10px] text-white/40">
                {metric.label}
              </p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="space-y-4 p-4">
          <h4 className="text-sm font-semibold text-white">
            Account Information
          </h4>

          <div className="flex items-center gap-3">
            <Mail size={16} className="text-white/40" />
            <div>
              <p className="text-xs text-white/40">Owner email</p>
              <p className="text-sm text-white">
                {tenant.ownerEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone size={16} className="text-white/40" />
            <div>
              <p className="text-xs text-white/40">Phone</p>
              <p className="text-sm text-white">
                {tenant.ownerPhone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck size={16} className="text-white/40" />
            <div>
              <p className="text-xs text-white/40">Subscription plan</p>
              <p className="text-sm text-white">
                {tenant.planName}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-3 p-4">
          <h4 className="text-sm font-semibold text-white">
            Branches
          </h4>

          {tenant.branches.length === 0 ? (
            <p className="text-xs text-white/40">
              No branch details available.
            </p>
          ) : (
            tenant.branches.map((branch) => (
              <div
                key={branch.id}
                className="rounded-xl border border-white/[0.06] p-3"
              >
                <p className="text-sm font-medium text-white">
                  {branch.name}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {branch.code}
                </p>
                <p className="mt-2 flex items-center gap-1 text-xs text-white/50">
                  <MapPin size={12} />
                  {branch.address}
                </p>
              </div>
            ))
          )}
        </GlassCard>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">
            Administrative Actions
          </h4>

          {tenant.status === "SUSPENDED" ? (
            <GlassButton
              variant="success"
              onClick={() => onStatusChange(tenant.id, "ACTIVE")}
              className="w-full"
            >
              Restore Business
            </GlassButton>
          ) : (
            <GlassButton
              variant="danger"
              onClick={() => onStatusChange(tenant.id, "SUSPENDED")}
              className="w-full"
            >
              Suspend Business
            </GlassButton>
          )}
        </div>
      </div>
    </GlassSheet>
  );
}
