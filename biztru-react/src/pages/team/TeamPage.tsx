import {
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  Plus,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react";

import { GlassCard } from "../../components/ui/GlassCard";
import { GlassIcon } from "../../components//ui/GlassIcon";
import { GlassButton } from "../../components/ui/GlassButton";

import StaffInvitationSheet, {
  type BranchOption,
  type StaffInvitationData,
} from "../../components/employeeComponent/StaffInvitationSheet";

import StaffCard, {
  type StaffMember,
} from "../../components/employeeComponent/StaffCard";

const BRANCHES: BranchOption[] = [
  {
    id: "branch-wuse",
    name: "Wuse Branch",
  },
  {
    id: "branch-garki",
    name: "Garki Branch",
  },
  {
    id: "branch-maitama",
    name: "Maitama Branch",
  },
];

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "user-musa",
    name: "Musa Ibrahim",
    phone: "08012345678",
    email: "musa@example.com",
    role: "STAFF",
    branchId: "branch-wuse",
    branchName: "Wuse Branch",
    employmentStatus: "ACTIVE",
    joinedAt: "2026-09-12",
  },
  {
    id: "user-chinedu",
    name: "Chinedu Okafor",
    phone: "08098765432",
    email: "chinedu@example.com",
    role: "MANAGER",
    branchId: "branch-garki",
    branchName: "Garki Branch",
    employmentStatus: "ACTIVE",
    joinedAt: "2026-08-21",
  },
  {
    id: "user-sarah",
    name: "Sarah John",
    phone: "08111222333",
    role: "STAFF",
    branchId: "branch-wuse",
    branchName: "Wuse Branch",
    employmentStatus: "INVITED",
  },
];

export default function TeamPage() {
  const [
    inviteOpen,
    setInviteOpen,
  ] = useState(false);

  const [
    invitationLoading,
    setInvitationLoading,
  ] = useState(false);

  const [
    staff,
    setStaff,
  ] = useState<StaffMember[]>(
    INITIAL_STAFF
  );

  /*
   * ==========================================================
   * DERIVED TEAM METRICS
   * ==========================================================
   */

  const activeCount = useMemo(
    () =>
      staff.filter(
        (member) =>
          member.employmentStatus ===
          "ACTIVE"
      ).length,
    [staff]
  );

  const invitedCount = useMemo(
    () =>
      staff.filter(
        (member) =>
          member.employmentStatus ===
          "INVITED"
      ).length,
    [staff]
  );

  const managerCount = useMemo(
    () =>
      staff.filter(
        (member) =>
          member.role === "MANAGER"
      ).length,
    [staff]
  );

  /*
   * ==========================================================
   * INVITE STAFF
   * ==========================================================
   */

  const handleInvite = async (
    data: StaffInvitationData
  ) => {
    setInvitationLoading(true);

    try {
      /*
       * TEMPORARY LOCAL IMPLEMENTATION
       *
       * Replace this section with:
       *
       * await businessInvitationService.create(...)
       *
       * once the invitation application service exists.
       */

      const branch =
        BRANCHES.find(
          (item) =>
            item.id === data.branchId
        );

      const newMember: StaffMember = {
        id:
          `invitation-${Date.now()}`,

        name: data.fullName,

        phone: data.phone,

        email:
          data.email || null,

        role: data.role,

        branchId:
          data.branchId,

        branchName:
          branch?.name ?? null,

        employmentStatus:
          "INVITED",
      };

      setStaff((previous) => [
        newMember,
        ...previous,
      ]);

      setInviteOpen(false);

    } finally {
      setInvitationLoading(false);
    }
  };

  /*
   * ==========================================================
   * MANAGE STAFF
   * ==========================================================
   */

  const handleManage = (
    member: StaffMember
  ) => {
    /*
     * Next step:
     *
     * open StaffManagementSheet
     *
     * where owner can:
     *
     * - change role
     * - change branch
     * - suspend
     * - reactivate
     * - revoke invitation
     */
    console.log(
      "Manage staff:",
      member
    );
  };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
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

        {/* ==================================================
            PAGE HEADER
            ================================================== */}

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <div className="flex items-center gap-3">
              <GlassIcon
                size="md"
                variant="primary"
              >
                <Users size={21} />
              </GlassIcon>

              <div>
                <h1
                  className="
                    text-2xl
                    font-semibold
                    tracking-tight
                    text-white
                  "
                >
                  Team
                </h1>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Manage your staff and
                  business roles.
                </p>
              </div>
            </div>
          </div>

          <GlassButton
            onClick={() =>
              setInviteOpen(true)
            }
            className="
              h-12
              rounded-2xl
              px-5
              font-semibold
              shadow-[0_8px_30px_rgba(20,184,166,0.10)]
            "
          >
            <span className="flex items-center gap-2">
              <Plus size={18} />

              Add Staff
            </span>
          </GlassButton>
        </div>

        {/* ==================================================
            SUMMARY
            ================================================== */}

        <div
          className="
            mt-7
            grid
            grid-cols-2
            gap-3
            lg:grid-cols-4
          "
        >

          {/* TOTAL */}

          <GlassCard
            className="
              p-4
            "
          >
            <div className="flex items-center gap-3">

              <GlassIcon
                size="sm"
                variant="primary"
              >
                <Users size={17} />
              </GlassIcon>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-600">
                  Team
                </p>

                <p className="mt-1 text-xl font-semibold text-white">
                  {staff.length}
                </p>
              </div>

            </div>
          </GlassCard>

          {/* ACTIVE */}

          <GlassCard
            className="
              p-4
            "
          >
            <div className="flex items-center gap-3">

              <GlassIcon
                size="sm"
                variant="success"
              >
                <CheckCircle2 size={17} />
              </GlassIcon>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-600">
                  Active
                </p>

                <p className="mt-1 text-xl font-semibold text-white">
                  {activeCount}
                </p>
              </div>

            </div>
          </GlassCard>

          {/* MANAGERS */}

          <GlassCard
            className="
              p-4
            "
          >
            <div className="flex items-center gap-3">

              <GlassIcon
                size="sm"
                variant="primary"
              >
                <ShieldCheck size={17} />
              </GlassIcon>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-600">
                  Managers
                </p>

                <p className="mt-1 text-xl font-semibold text-white">
                  {managerCount}
                </p>
              </div>

            </div>
          </GlassCard>

          {/* INVITED */}

          <GlassCard
            className="
              p-4
            "
          >
            <div className="flex items-center gap-3">

              <GlassIcon
                size="sm"
                variant="primary"
              >
                <Clock3 size={17} />
              </GlassIcon>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-600">
                  Pending
                </p>

                <p className="mt-1 text-xl font-semibold text-white">
                  {invitedCount}
                </p>
              </div>

            </div>
          </GlassCard>

        </div>

        {/* ==================================================
            TEAM SECTION
            ================================================== */}

        <section className="mt-8">

          <div
            className="
              mb-4
              flex
              items-center
              justify-between
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

          {/* ==================================================
              STAFF GRID
              ================================================== */}

          {staff.length > 0 ? (
            <div
              className="
                grid
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {staff.map((member) => (
                <StaffCard
                  key={member.id}
                  member={member}
                  onManage={
                    handleManage
                  }
                />
              ))}
            </div>
          ) : (
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
              <GlassIcon
                size="lg"
                variant="primary"
              >
                <UserRound size={25} />
              </GlassIcon>

              <h3 className="mt-5 text-base font-semibold text-white">
                No team members yet
              </h3>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                Invite your first staff member
                to start building your team.
              </p>

              <GlassButton
                onClick={() =>
                  setInviteOpen(true)
                }
                className="
                  mt-6
                  h-11
                  rounded-xl
                  px-5
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

      {/* ====================================================
          INVITATION SHEET
          ==================================================== */}

      <StaffInvitationSheet
        open={inviteOpen}
        branches={BRANCHES}
        loading={invitationLoading}
        onClose={() =>
          setInviteOpen(false)
        }
        onSubmit={handleInvite}
      />

    </div>
  );
}