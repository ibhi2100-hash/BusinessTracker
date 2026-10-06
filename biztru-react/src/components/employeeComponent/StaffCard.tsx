import {
  Building2,
  MoreHorizontal,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { DataCard } from "../ui/DataCard";
import { GlassIcon } from "../ui/GlassIcon";

export type StaffRole =
  | "ADMIN"
  | "MANAGER"
  | "STAFF";

export type StaffEmploymentStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "INVITED";

export interface StaffMember {
  id: string;

  name: string;

  phone?: string | null;

  email?: string | null;

  role: StaffRole;

  branchId?: string | null;

  branchName?: string | null;

  employmentStatus: StaffEmploymentStatus;

  joinedAt?: string | null;
}

interface Props {
  member: StaffMember;

  onManage?: (
    member: StaffMember
  ) => void;
}

function roleLabel(
  role: StaffRole
): string {
  switch (role) {
    case "ADMIN":
      return "Administrator";

    case "MANAGER":
      return "Manager";

    case "STAFF":
      return "Staff";

    default:
      return role;
  }
}

function statusLabel(
  status: StaffEmploymentStatus
): string {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "SUSPENDED":
      return "Suspended";

    case "INVITED":
      return "Invitation pending";

    default:
      return status;
  }
}

function statusClass(
  status: StaffEmploymentStatus
): string {
  switch (status) {
    case "ACTIVE":
      return `
        border-emerald-400/20
        bg-emerald-400/10
        text-emerald-300
      `;

    case "SUSPENDED":
      return `
        border-red-400/20
        bg-red-400/10
        text-red-300
      `;

    case "INVITED":
      return `
        border-amber-400/20
        bg-amber-400/10
        text-amber-300
      `;

    default:
      return `
        border-white/10
        bg-white/5
        text-gray-400
      `;
  }
}

export default function StaffCard({
  member,
  onManage,
}: Props) {
  return (
    <DataCard
      title={member.name}
      subtitle={
        member.phone ||
        member.email ||
        "No contact information"
      }
      variant="person"
      image={undefined}
      badge={
        <span
          className={`
            inline-flex
            items-center
            rounded-full
            border
            px-2.5
            py-1
            text-[10px]
            font-medium
            ${statusClass(
              member.employmentStatus
            )}
          `}
        >
          {statusLabel(
            member.employmentStatus
          )}
        </span>
      }
      metrics={[
        {
          label: "Role",
          value: roleLabel(member.role),
        },
        {
          label: "Branch",
          value:
            member.branchName ||
            "Unassigned",
        },
      ]}
      actions={
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onManage?.(member);
          }}
          className="
            flex
            h-10
            flex-1
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-white/10
            bg-white/5
            text-xs
            font-medium
            text-gray-300
            transition
            hover:bg-white/10
            hover:text-white
            active:scale-[0.97]
          "
        >
          <MoreHorizontal size={15} />

          Manage
        </button>
      }
      footer={
        <div className="flex items-center gap-2">

          <GlassIcon
            size="sm"
            variant={
              member.role === "MANAGER"
                ? "success"
                : "primary"
            }
          >
            {member.role === "MANAGER" ? (
              <ShieldCheck size={16} />
            ) : (
              <UserRound size={16} />
            )}
          </GlassIcon>

          <div className="min-w-0">
            <p className="truncate text-[11px] text-gray-500">
              {member.role === "ADMIN"
                ? "Business administrator"
                : member.role === "MANAGER"
                  ? "Branch management"
                  : "Sales & operations"}
            </p>

            {member.branchName && (
              <div className="mt-1 flex items-center gap-1">
                <Building2 size={11} />

                <span className="truncate text-[10px] text-gray-600">
                  {member.branchName}
                </span>
              </div>
            )}
          </div>

        </div>
      }
    />
  );
}