import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import {
  BriefcaseBusiness,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { GlassSheet } from "../ui/GlassSheet";
import { GlassInput } from "../ui/GlassInput";
import { GlassButton } from "../ui/GlassButton";

export type StaffRole =
  | "STAFF"
  | "MANAGER";

export type EmploymentStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "INVITED";

export interface StaffInvitationData {
  fullName: string;
  phone: string;
  email: string;
  role: StaffRole;
  branchId: string;
}

export interface BranchOption {
  id: string;
  name: string;
}

interface Props {
  open: boolean;

  branches: BranchOption[];

  loading?: boolean;

  onClose: () => void;

  onSubmit: (
    data: StaffInvitationData
  ) => void;
}

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  role: StaffRole;
  branchId: string;
}

const EMPTY_FORM: FormState = {
  fullName: "",
  phone: "",
  email: "",
  role: "STAFF",
  branchId: "",
};

export default function StaffInvitationSheet({
  open,
  branches,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] =
    useState<FormState>(EMPTY_FORM);

  /*
   * ==========================================================
   * RESET / HYDRATE
   * ==========================================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      ...EMPTY_FORM,
      branchId:
        branches.length === 1
          ? branches[0].id
          : "",
    });
  }, [open, branches]);

  /*
   * ==========================================================
   * INPUT HELPERS
   * ==========================================================
   */

  const updateField = <
    K extends keyof FormState
  >(
    field: K,
    value: FormState[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handlePhoneChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 15);

    updateField("phone", value);
  };

  /*
   * ==========================================================
   * VALIDATION
   * ==========================================================
   */

  const hasName =
    form.fullName.trim().length >= 2;

  const hasPhone =
    form.phone.trim().length >= 7;

  const hasEmail =
    form.email.trim().length === 0 ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      form.email.trim()
    );

  const hasRole =
    form.role === "STAFF" ||
    form.role === "MANAGER";

  const hasBranch =
    form.branchId.trim().length > 0;

  const isValid =
    hasName &&
    hasPhone &&
    hasEmail &&
    hasRole &&
    hasBranch;

  /*
   * ==========================================================
   * CLOSE
   * ==========================================================
   */

  const handleClose = () => {
    if (loading) {
      return;
    }

    setForm(EMPTY_FORM);

    onClose();
  };

  /*
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */

  const handleSubmit = () => {
    if (loading || !isValid) {
      return;
    }

    onSubmit({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      role: form.role,
      branchId: form.branchId,
    });
  };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  if (!open) {
    return null;
  }

  return (
    <GlassSheet
      open={open}
      onClose={handleClose}
      size="lg"
      title="Add Staff"
      subtitle="Invite a team member to your business"
      loading={loading}
    >
      <div className="space-y-7 pb-4">

        {/* ==================================================
            STAFF IDENTITY
            ================================================== */}

        <section className="space-y-2">
          <label
            className="
              block
              text-xs
              font-medium
              uppercase
              tracking-wider
              text-gray-500
            "
          >
            Full name
          </label>

          <GlassInput
            value={form.fullName}
            onChange={(event) =>
              updateField(
                "fullName",
                event.target.value
              )
            }
            icon={<UserRound size={18} />}
            placeholder="e.g. Musa Ibrahim"
            disabled={loading}
            className="h-13 rounded-2xl"
            autoComplete="name"
          />
        </section>

        {/* ==================================================
            PHONE
            ================================================== */}

        <section className="space-y-2">
          <label
            className="
              block
              text-xs
              font-medium
              uppercase
              tracking-wider
              text-gray-500
            "
          >
            Phone number
          </label>

          <GlassInput
            value={form.phone}
            onChange={handlePhoneChange}
            icon={<Phone size={18} />}
            placeholder="e.g. 08012345678"
            disabled={loading}
            className="h-13 rounded-2xl"
            inputMode="tel"
            autoComplete="tel"
          />

          <p className="px-1 text-[11px] text-gray-600">
            Used to identify and invite the staff member.
          </p>
        </section>

        {/* ==================================================
            EMAIL
            ================================================== */}

        <section className="space-y-2">
          <label
            className="
              block
              text-xs
              font-medium
              uppercase
              tracking-wider
              text-gray-500
            "
          >
            Email
            <span className="ml-1 normal-case text-gray-700">
              optional
            </span>
          </label>

          <GlassInput
            value={form.email}
            onChange={(event) =>
              updateField(
                "email",
                event.target.value
              )
            }
            icon={<Mail size={18} />}
            placeholder="e.g. musa@example.com"
            disabled={loading}
            className="h-13 rounded-2xl"
            inputMode="email"
            autoComplete="email"
          />
        </section>

        {/* ==================================================
            ROLE
            ================================================== */}

        <section>
          <label
            className="
              mb-2
              block
              text-xs
              font-medium
              uppercase
              tracking-wider
              text-gray-500
            "
          >
            Role
          </label>

          <div className="grid grid-cols-2 gap-3">

            {/* STAFF */}

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                updateField(
                  "role",
                  "STAFF"
                )
              }
              className={`
                relative
                overflow-hidden
                rounded-[22px]
                border
                p-4
                text-left
                transition-all
                duration-200

                ${
                  form.role === "STAFF"
                    ? `
                      border-teal-400/50
                      bg-teal-400/10
                      shadow-[0_0_35px_rgba(20,184,166,0.10)]
                    `
                    : `
                      border-white/10
                      bg-black/20
                      hover:bg-white/5
                    `
                }

                disabled:cursor-not-allowed
                disabled:opacity-50
              `}
            >
              {form.role === "STAFF" && (
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    h-px
                    bg-teal-300/50
                  "
                />
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl

                    ${
                      form.role === "STAFF"
                        ? "bg-teal-400/15 text-teal-300"
                        : "bg-white/5 text-gray-500"
                    }
                  `}
                >
                  <BriefcaseBusiness size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Staff
                  </p>

                  <p className="mt-1 text-[11px] text-gray-500">
                    Sales & daily operations
                  </p>
                </div>
              </div>
            </button>

            {/* MANAGER */}

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                updateField(
                  "role",
                  "MANAGER"
                )
              }
              className={`
                relative
                overflow-hidden
                rounded-[22px]
                border
                p-4
                text-left
                transition-all
                duration-200

                ${
                  form.role === "MANAGER"
                    ? `
                      border-amber-400/50
                      bg-amber-400/10
                      shadow-[0_0_35px_rgba(245,158,11,0.10)]
                    `
                    : `
                      border-white/10
                      bg-black/20
                      hover:bg-white/5
                    `
                }

                disabled:cursor-not-allowed
                disabled:opacity-50
              `}
            >
              {form.role === "MANAGER" && (
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    h-px
                    bg-amber-300/50
                  "
                />
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl

                    ${
                      form.role === "MANAGER"
                        ? "bg-amber-400/15 text-amber-300"
                        : "bg-white/5 text-gray-500"
                    }
                  `}
                >
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Manager
                  </p>

                  <p className="mt-1 text-[11px] text-gray-500">
                    Branch operations
                  </p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* ==================================================
            BRANCH
            ================================================== */}

        <section>
          <label
            className="
              mb-2
              block
              text-xs
              font-medium
              uppercase
              tracking-wider
              text-gray-500
            "
          >
            Branch
          </label>

          <div className="relative">
            <Building2
              size={18}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                z-10
                -translate-y-1/2
                text-gray-500
              "
            />

            <select
              value={form.branchId}
              onChange={(event) =>
                updateField(
                  "branchId",
                  event.target.value
                )
              }
              disabled={
                loading ||
                branches.length === 0
              }
              className="
                h-13
                w-full
                appearance-none
                rounded-2xl
                border
                border-white/10
                bg-black/20
                pl-12
                pr-4
                text-sm
                text-white
                outline-none
                transition-all
                focus:border-teal-400/40
                focus:ring-0
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <option
                value=""
                className="bg-neutral-900"
              >
                Select branch
              </option>

              {branches.map((branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                  className="bg-neutral-900"
                >
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {branches.length === 0 && (
            <p className="mt-2 px-1 text-[11px] text-amber-400/70">
              Create a branch before assigning staff.
            </p>
          )}
        </section>

        {/* ==================================================
            INVITATION PREVIEW
            ================================================== */}

        {isValid && (
          <div
            className="
              rounded-2xl
              border
              border-white/6
              bg-white/[0.025]
              px-4
              py-4
            "
          >
            <div className="flex items-start gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-teal-500/10
                  text-teal-400
                "
              >
                <UserRound size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {form.fullName.trim()}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {form.role === "MANAGER"
                    ? "Manager"
                    : "Staff"}
                  {" • "}
                  {branches.find(
                    (branch) =>
                      branch.id ===
                      form.branchId
                  )?.name ?? "Unknown branch"}
                </p>

                <p className="mt-2 text-[11px] text-gray-600">
                  An invitation will be created for this
                  team member.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            ACTION
            ================================================== */}

        <div className="pt-1">
          <GlassButton
            className="
              h-13
              w-full
              rounded-2xl
              font-semibold
              shadow-[0_8px_30px_rgba(255,255,255,0.06)]
              transition
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            onClick={handleSubmit}
            disabled={!isValid || loading}
          >
            {loading
              ? "Creating Invitation..."
              : "Send Invitation"}
          </GlassButton>
        </div>

      </div>
    </GlassSheet>
  );
}