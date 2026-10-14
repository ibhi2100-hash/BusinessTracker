
import { useCallback, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Plus,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react";

import { GlassCard } from "../../components/ui/GlassCard";
import { GlassIcon } from "../../components/ui/GlassIcon";
import { GlassButton } from "../../components/ui/GlassButton";

import StaffInvitationSheet from "../../components/employeeComponent/StaffInvitationSheet";

import StaffCard from "../../components/employeeComponent/StaffCard";

import { useBranchLiveQuery } from "../../hooks/useBranches";
import { useLiveEmployees } from "../../hooks/useLiveEmployees";

import { useBusinessContext } from "../../Biztru/context/BusinessContext";
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";

import type { InviteEmployeeRequest } from "../../Biztru/services/ApplicationService/API/employee/EmployeeRequests";
import type { StaffInvitationData } from "../../schemas/staff.schema";

/* ================================================================
   TEAM PAGE
================================================================ */

export default function TeamPage() {
  const app = useApplication();
  const { businessId } = useBusinessContext();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationError, setInvitationError] = useState<string | null>(
    null,
  );

  /*
   * ==============================================================
   * LIVE BRANCH PROJECTION
   * ==============================================================
   */

  const {
    data: branchData,
  } = useBranchLiveQuery(businessId);

  const branches = branchData ?? [];

  /*
   * ==============================================================
   * LIVE EMPLOYEE PROJECTION
   * ==============================================================
   */

  const {
    data: staffData,
    loading: staffLoading,
    error: staffError,
  } = useLiveEmployees(businessId);

  const staff = staffData ?? [];
  console.log("This is the Staff i gets: ", staff)

  /*
   * ==============================================================
   * DERIVED TEAM METRICS
   * ==============================================================
   */

  const activeCount = useMemo(
    () =>
      staff.filter(
        (member) => member.employmentStatus === "ACTIVE",
      ).length,
    [staff],
  );
  const invitedCount = useMemo(
    () =>
      staff.filter(
        (member) => member.employmentStatus === "INVITED",
      ).length,
    [staff],
  );

  const managerCount = useMemo(
    () =>
      staff.filter(
        (member) => member.role === "MANAGER",
      ).length,
    [staff],
  );

  /*
   * ==============================================================
   * OPEN INVITATION SHEET
   * ==============================================================
   */

  const openInvitationSheet = useCallback(() => {
    if (!businessId || invitationLoading) {
      return;
    }

    setInvitationError(null);
    setInviteOpen(true);
  }, [businessId, invitationLoading]);

  const closeInvitationSheet = useCallback(() => {
    if (invitationLoading) {
      return;
    }

    setInviteOpen(false);
    setInvitationError(null);
  }, [invitationLoading]);

  /*
   * ==============================================================
   * CREATE STAFF INVITATION
   * ==============================================================
   *
   * The sheet validates form fields.
   * The application service handles the invitation command.
   * The live employee projection supplies the rendered staff list.
   *
   * Do not manually append an employee to `staff` here.
   * The local projection should update through the application's
   * normal command/event/projection workflow.
   */

  const handleInvite = useCallback(
    async (data: StaffInvitationData): Promise<void> => {
      if (invitationLoading) {
        throw new Error(
          "An invitation is already being processed.",
        );
      }

      if (!businessId) {
        throw new Error(
          "A business must be selected before inviting staff.",
        );
      }

      setInvitationLoading(true);
      setInvitationError(null);

      try {
        /*
         * Revalidate branch existence immediately before
         * submitting the invitation command.
         */
        const branch = branches.find(
          (item) => item.id === data.branchId,
        );

        if (!branch) {
          throw new Error(
            "The selected branch is no longer available. Please select another branch.",
          );
        }

        const request: InviteEmployeeRequest = {
          fullName: data.fullName.trim(),
          phone: data.phone.trim(),
          email: data.email.trim() || null,
          role: data.role,
          branchId: branch.id,
          branchName: branch.name,
          employmentStatus: "INVITED",
        };

        /*
         * Keep the application's existing service boundary.
         * Errors propagate to the sheet, which displays them.
         */
        await app.employee.inviteEmployee(request);

        /*
         * Close only after the service reports success.
         * The live query is responsible for reflecting the
         * resulting employee projection.
         */
        setInviteOpen(false);
        setInvitationError(null);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to create the staff invitation. Please try again.";

        setInvitationError(message);

        /*
         * Rethrow so StaffInvitationSheet can display the error.
         * Do not silently swallow invitation failures.
         */
        throw error;
      } finally {
        setInvitationLoading(false);
      }
    },
    [
      app,
      businessId,
      branches,
      invitationLoading,
    ],
  );

  /*
   * ==============================================================
   * MANAGE STAFF
   * ==============================================================
   */

  const handleManage = useCallback(
    (member: StaffMember) => {
      /*
       * Connect this handler to StaffManagementSheet when
       * the management workflow is implemented.
       */
      console.info("Staff management requested", {
        employeeId: member.id,
      });
    },
    [],
  );

  /*
   * ==============================================================
   * RENDER
   * ==============================================================
   */

  return (
    <div
      className="
        min-h-screen
        px-4
        pb-28
        pt-6
        sm:px-6
        lg:px-8
        lg:pb-10
      "
    >
      <div className="mx-auto max-w-7xl">
        {/* ======================================================
            PAGE HEADER
        ======================================================= */}

        <header
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-center gap-3">
            <GlassIcon size="md" variant="primary">
              <Users size={21} />
            </GlassIcon>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Team
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your staff and business roles.
              </p>
            </div>
          </div>

          <GlassButton
            type="button"
            onClick={openInvitationSheet}
            disabled={
              !businessId ||
              invitationLoading
            }
            className="
              h-12
              rounded-2xl
              px-5
              font-semibold
              shadow-[0_8px_30px_rgba(20,184,166,0.10)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <span className="flex items-center gap-2">
              <Plus size={18} />
              Add Staff
            </span>
          </GlassButton>
        </header>

        {/* ======================================================
            BUSINESS CONTEXT VALIDATION
        ======================================================= */}

        {!businessId && (
          <div
            role="alert"
            className="
              mt-6
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-amber-500/20
              bg-amber-500/5
              p-4
            "
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-amber-400"
            />

            <div>
              <p className="text-sm font-medium text-amber-300">
                Business context unavailable
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Select or initialize a business before managing
                team members.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            INVITATION ERROR
        ======================================================= */}

        {invitationError && !inviteOpen && (
          <div
            role="alert"
            className="
              mt-6
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-red-500/20
              bg-red-500/5
              p-4
            "
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>
              <p className="text-sm font-medium text-red-300">
                Invitation failed
              </p>

              <p className="mt-1 text-xs leading-5 text-red-400/80">
                {invitationError}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            SUMMARY METRICS
        ======================================================= */}

        <section
          aria-label="Team summary"
          className="
            mt-7
            grid
            grid-cols-2
            gap-3
            lg:grid-cols-4
          "
        >
          <MetricCard
            label="Team"
            value={staff.length}
            icon={<Users size={17} />}
            variant="primary"
          />

          <MetricCard
            label="Active"
            value={activeCount}
            icon={<CheckCircle2 size={17} />}
            variant="success"
          />

          <MetricCard
            label="Managers"
            value={managerCount}
            icon={<ShieldCheck size={17} />}
            variant="primary"
          />

          <MetricCard
            label="Pending"
            value={invitedCount}
            icon={<Clock3 size={17} />}
            variant="primary"
          />
        </section>

        {/* ======================================================
            TEAM MEMBERS
        ======================================================= */}

        <section className="mt-8">
          <div
            className="
              mb-4
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <div>
              <h2 className="text-base font-semibold text-white">
                Team members
              </h2>

              <p className="mt-1 text-xs text-gray-600">
                People with access to this business.
              </p>
            </div>

            <span
              className="
                shrink-0
                rounded-full
                border
                border-white/10
                bg-white/5
                px-3
                py-1
                text-[10px]
                font-medium
                text-gray-500
              "
            >
              {staff.length} members
            </span>
          </div>

          {/* LOADING */}

          {staffLoading ? (
            <GlassCard className="p-8 text-center">
              <div
                className="
                  mx-auto
                  h-6
                  w-6
                  animate-spin
                  rounded-full
                  border-2
                  border-white/10
                  border-t-teal-400
                "
                aria-hidden="true"
              />

              <p className="mt-4 text-sm text-gray-400">
                Loading team members...
              </p>
            </GlassCard>
          ) : staffError ? (
            /* QUERY ERROR */

            <GlassCard className="p-8 text-center">
              <AlertCircle
                size={24}
                className="mx-auto text-red-400"
              />

              <h3 className="mt-4 text-sm font-semibold text-white">
                Unable to load team members
              </h3>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                The employee query encountered an error.
                Check the local database and live-query
                subscription before trying again.
              </p>
            </GlassCard>
          ) : staff.length > 0 ? (
            /* STAFF GRID */

            <div
              className="
                grid
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
            {staff.map((member) => {
              const branch =
                branches.find(
                  (item) => item.id === member.branchId
                ) ?? null;

              return (
                <StaffCard
                  key={member.id}
                  member={member}
                  branch={branch}
                  onManage={handleManage}
                />
              );
            })}
          </div>
          ) : (
            /* EMPTY STATE */

            <GlassCard
              className="
                flex
                flex-col
                items-center
                justify-center
                px-6
                py-16
                text-center
              "
            >
              <GlassIcon size="lg" variant="primary">
                <UserRound size={25} />
              </GlassIcon>

              <h3 className="mt-5 text-base font-semibold text-white">
                No team members yet
              </h3>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                Invite your first staff member to start
                building your team.
              </p>

              <GlassButton
                type="button"
                onClick={openInvitationSheet}
                disabled={!businessId || invitationLoading}
                className="
                  mt-6
                  h-11
                  rounded-xl
                  px-5
                  disabled:opacity-50
                "
              >
                <span className="flex items-center gap-2">
                  <Plus size={16} />
                  Add Staff
                </span>
              </GlassButton>
            </GlassCard>
          )}
        </section>
      </div>

      {/* ========================================================
          STAFF INVITATION SHEET
      ========================================================= */}

      <StaffInvitationSheet
        open={inviteOpen}
        branches={branches}
        loading={invitationLoading}
        onClose={closeInvitationSheet}
        onSubmit={handleInvite}
      />
    </div>
  );
}

/* ================================================================
   METRIC CARD
================================================================ */

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant: "primary" | "success";
}

function MetricCard({
  label,
  value,
  icon,
  variant,
}: MetricCardProps) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3">
        <GlassIcon size="sm" variant={variant}>
          {icon}
        </GlassIcon>

        <div>
          <p className="text-[11px] uppercase tracking-wider text-gray-600">
            {label}
          </p>

          <p className="mt-1 text-xl font-semibold text-white">
            {value}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
