
import { useCallback, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";

import { GlassCard } from "../../components/ui/GlassCard";
import { GlassIcon } from "../../components/ui/GlassIcon";
import { GlassButton } from "../../components/ui/GlassButton";

import StaffInvitationSheet from "../../components/employeeComponent/StaffInvitationSheet";
import StaffCard from "../../components/employeeComponent/StaffCard";

import { useBranchLiveQuery } from "../../hooks/useBranches";
import { useLiveEmployees } from "../../hooks/useLiveEmployees";
import { useLiveAuth } from "../../hooks/useLiveAuth";

import { useBusinessContext } from "../../Biztru/context/BusinessContext";
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useRouteAccess } from "../../hooks/useAuthGuard";

import type { InviteEmployeeRequest } from "../../Biztru/services/ApplicationService/API/employee/EmployeeRequests";
import type { StaffInvitationData } from "../../schemas/staff.schema";
import type { Employee } from "@business/shared-types";

import type { StaffRole } from "../../components/employeeComponent/StaffInvitationSheet";

export default function TeamPage() {
  const app = useApplication();
  const { businessId } = useBusinessContext();

  const { data: auth, loading: authLoading } = useLiveAuth();
  const routeAccess = useRouteAccess();

  const user = auth?.user;
  const actorRole = routeAccess.role;
const actorBranchId = user?.branchId;

  const canManageTeam = routeAccess.canMutate("team:manage");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationError, setInvitationError] = useState<string | null>(null);

  const { data: branchData } = useBranchLiveQuery(businessId);
  const allBranches = branchData ?? [];

  const { data: staffData, loading: staffLoading, error: staffError } =
    useLiveEmployees(businessId);

  const staff = staffData ?? [];

  /*
   * Resolve the invitation policy from the authenticated actor.
   *
   * CEO:
   *   - MANAGER only
   *   - Any branch in this business
   *
   * MANAGER:
   *   - STAFF only
   *   - Their assigned branch only
   */

const invitationPolicy = useMemo(() => {
  if (!canManageTeam) {
    return {
      allowedRoles: [] as StaffRole[],
      permittedBranches: [],
    };
  }

  // CEO and ADMIN can manage employees across the business.
  if (actorRole === "CEO" || actorRole === "ADMIN") {
    return {
      allowedRoles: ["MANAGER", "STAFF"] as StaffRole[],
      permittedBranches: allBranches,
    };
  }

  // Managers can only invite staff into their assigned branch.
  if (actorRole === "MANAGER" && actorBranchId) {
    return {
      allowedRoles: ["STAFF"] as StaffRole[],
      permittedBranches: allBranches.filter(
        (branch) => branch.id === actorBranchId
      ),
    };
  }

  return {
    allowedRoles: [] as StaffRole[],
    permittedBranches: [],
  };
}, [canManageTeam, actorRole, actorBranchId, allBranches]);
// Permission to invite, independent of branch loading.
const canInvite =
  !authLoading &&
  canManageTeam &&
  invitationPolicy.allowedRoles.length > 0;

const hasInvitationBranch =
  invitationPolicy.permittedBranches.length > 0;

  const activeCount = useMemo(
    () => staff.filter((member) => member.employmentStatus === "ACTIVE").length,
    [staff],
  );

  const invitedCount = useMemo(
    () => staff.filter((member) => member.employmentStatus === "INVITED").length,
    [staff],
  );

  const managerCount = useMemo(
    () => staff.filter((member) => member.role === "MANAGER").length,
    [staff],
  );

  const openInvitationSheet = useCallback(() => {
    if (!businessId || !canInvite || invitationLoading) return;

    setInvitationError(null);
    setInviteOpen(true);
  }, [businessId, canInvite, invitationLoading]);

  const closeInvitationSheet = useCallback(() => {
    if (invitationLoading) return;

    setInviteOpen(false);
    setInvitationError(null);
  }, [invitationLoading]);

  const handleInvite = useCallback(
    async (data: StaffInvitationData): Promise<void> => {
      if (invitationLoading) {
        throw new Error("An invitation is already being processed.");
      }

      if (!businessId || !user) {
        throw new Error("Your authenticated business session is unavailable.");
      }

      if (!routeAccess.canMutate("team:manage")) {
        throw new Error("You are not authorized to invite team members.");
      }

      /*
       * Re-evaluate the actor policy at submission time.
       * Do not rely only on the sheet's hidden role options.
       */
      
      let permittedRoles: readonly StaffRole[];
      let permittedBranchId: string | undefined;

      if (routeAccess.role === "CEO" || routeAccess.role === "ADMIN") {
        permittedRoles = ["MANAGER", "STAFF"];
      } else if (routeAccess.role === "MANAGER" && user.branchId) {
        permittedRoles = ["STAFF"];
        permittedBranchId = user.branchId;
      } else {
        throw new Error("Your role cannot invite team members.");
      }

      if (!permittedRoles.includes(data.role)) {
        throw new Error("You are not authorized to assign this employee role.");
      }

      if (permittedBranchId && data.branchId !== permittedBranchId) {
        throw new Error("You can only invite staff into your assigned branch.");
      }

      const branch = allBranches.find(
        (item) => item.id === data.branchId
      );

      if (!branch) {
        throw new Error("The selected branch is not available.");
      }

      setInvitationLoading(true);
      setInvitationError(null);

      try {
        const request: InviteEmployeeRequest = {
          fullName: data.fullName.trim(),
          phone: data.phone.trim(),
          email: data.email.trim() || null,
          role: data.role,
          branchId: branch.id,
          branchName: branch.name,
          employmentStatus: "INVITED",
        };

        await app.employee.inviteEmployee(request);

        setInviteOpen(false);
        setInvitationError(null);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to create the employee invitation.";

        setInvitationError(message);
        throw error;
      } finally {
        setInvitationLoading(false);
      }
    },
    [
      app,
      businessId,
      user,
      allBranches,
      invitationLoading,
      routeAccess,
    ],
  );

  const handleManage = useCallback((member: Employee) => {
    console.info("Staff management requested", {
      employeeId: member.id,
    });
  }, []);

  const invitationTitle =
    actorRole === "CEO" ? "Add Manager" : "Add Staff";

    console.log("TEAM PAGE ACCESS", {
      role: routeAccess.role,
      context: routeAccess.context.type,
      readOnly: routeAccess.readOnly,
      permissions: routeAccess.permissions,
      canReadTeam: routeAccess.can("team:read"),
      canManageTeam: routeAccess.can("team:manage"),
      canMutateTeam: routeAccess.canMutate("team:manage"),
      businessId,
      userRole: user?.role,
      branchId: user?.branchId,
    });
  return (
    <div className="min-h-screen px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <GlassIcon size="md" variant="primary">
              <Users size={21} />
            </GlassIcon>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Team
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your team and employee assignments.
              </p>
            </div>
          </div>

          
        { canManageTeam && (
          <GlassButton
            type="button"
            onClick={openInvitationSheet}
            disabled={
              !canInvite ||
              invitationLoading ||
              !branchData ||
              !hasInvitationBranch
            }
            className="flex items-center gap-2"
          >
            <Plus size={17} />
            Add Employee
          </GlassButton>
        )}

        {!authLoading && !canManageTeam && (
          <p className="text-xs text-amber-400">
            You do not have permission to manage employees.
          </p>
        )}

        {canManageTeam && !branchData && (
          <p className="text-xs text-gray-400">
            Loading branch information...
          </p>
        )}

        {canManageTeam && branchData && !hasInvitationBranch && (
          <p className="text-xs text-amber-400">
            No eligible branch is available for employee assignment.
          </p>
        )}

        </header>

        {invitationError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400"
          >
            <AlertCircle size={16} />
            <span>{invitationError}</span>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Active employees</p>
              <GlassIcon size="sm" variant="success">
                <CheckCircle2 size={17} />
              </GlassIcon>
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {staffLoading ? "—" : activeCount}
            </p>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Pending invitations</p>
              <GlassIcon size="sm" variant="primary">
                <Clock3 size={17} />
              </GlassIcon>
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {staffLoading ? "—" : invitedCount}
            </p>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Branch managers</p>
              <GlassIcon size="sm" variant="primary">
                <ShieldCheck size={17} />
              </GlassIcon>
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">
              {staffLoading ? "—" : managerCount}
            </p>
          </GlassCard>
        </div>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Employees
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {staff.length} employee records
              </p>
            </div>
          </div>

          {Boolean(staffError) && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              Unable to load employees.
            </div>
          )}

          {staffLoading && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]"
                />
              ))}
            </div>
          )}

          {!staffLoading && !staffError && staff.length === 0 && (
            <GlassCard className="p-10 text-center">
              <Users className="mx-auto text-gray-500" size={32} />
              <h3 className="mt-4 text-base font-semibold text-white">
                No employees yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Your employee records will appear here after invitations are created.
              </p>
            </GlassCard>
          )}

          {!staffLoading && !staffError && staff.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {staff.map((member) => {
                const employeeBranch =
                  allBranches.find(
                    (branch) => branch.id === member.branchId
                  ) ?? null;

                return (
                  <StaffCard
                    key={member.id}
                    member={member}
                    branch={employeeBranch}
                    onManage={() => handleManage(member)}
                  />
                );
              })}
            </div>
          )}
        </section>

        {canInvite && (
          <StaffInvitationSheet
            open={inviteOpen}
            branches={invitationPolicy.permittedBranches}
            allowedRoles={invitationPolicy.allowedRoles}
            loading={invitationLoading}
            onClose={closeInvitationSheet}
            onSubmit={handleInvite}
          />
        )}
      </div>
    </div>
  );
}
