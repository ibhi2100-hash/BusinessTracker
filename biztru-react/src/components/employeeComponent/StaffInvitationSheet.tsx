
import { useCallback, useEffect, useMemo, useState } from "react";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  BriefcaseBusiness,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  AlertCircle,
  Sparkles,
  UserCog,
} from "lucide-react";

import type { Branch } from "@business/shared-types";

import { GlassSheet } from "../ui/GlassSheet";
import { GlassInput } from "../ui/GlassInput";
import { GlassButton } from "../ui/GlassButton";

import {
  createStaffInvitationSchema,
  type StaffInvitationData,
} from "../../schemas/staff.schema";

/* ================================================================
   TYPES
================================================================ */

export type StaffRole =
  | "STAFF"
  | "MANAGER"
  | "CLEANER"
  | "SALES_REPS";

export type InviterRole = "CEO" | "ADMIN" | "MANAGER";

interface Props {
  open: boolean;
  branches: Branch[];

  /** Roles the parent page permits this user to assign. */
  allowedRoles: readonly StaffRole[];

  /** Role of the authenticated user opening this sheet. */
  inviterRole: InviterRole;

  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: StaffInvitationData) => void | Promise<void>;
}

type FormState = StaffInvitationData;

const FIELD_CLASS = "h-13 rounded-2xl";

const LABEL_CLASS =
  "block text-xs font-medium uppercase tracking-wider text-gray-500";

const FIELD_ERROR_CLASS =
  "mt-1.5 flex items-start gap-1.5 px-1 text-[11px] leading-4 text-red-400";

/* ================================================================
   ROLE POLICY
================================================================ */

/**
 * CEO and ADMIN can invite branch managers.
 *
 * MANAGER can invite operational team members:
 * STAFF, CLEANER and SALES_REPS.
 *
 * This is a UI-level restriction. The invitation command/API
 * must enforce the same policy independently.
 */
const ROLE_POLICY: Record<InviterRole, readonly StaffRole[]> = {
  CEO: ["MANAGER"],
  ADMIN: ["MANAGER"],
  MANAGER: ["STAFF", "CLEANER", "SALES_REPS"],
};

const ROLE_DETAILS: Record<
  StaffRole,
  {
    title: string;
    description: string;
    icon: typeof BriefcaseBusiness;
  }
> = {
  MANAGER: {
    title: "Branch Manager",
    description: "Oversees branch operations",
    icon: ShieldCheck,
  },

  STAFF: {
    title: "Staff",
    description: "Sales and daily operations",
    icon: BriefcaseBusiness,
  },

  CLEANER: {
    title: "Cleaner",
    description: "Branch cleaning responsibilities",
    icon: Sparkles,
  },

  SALES_REPS: {
    title: "Sales Representative",
    description: "Customer sales and selling activities",
    icon: UserCog,
  },
};

/* ================================================================
   PAGE
================================================================ */

export default function StaffInvitationSheet({
  open,
  branches,
  allowedRoles,
  inviterRole,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* --------------------------------------------------------------
     AUTHORIZED ROLE OPTIONS
  -------------------------------------------------------------- */

  const visibleRoles = useMemo(() => {
    const policyRoles = ROLE_POLICY[inviterRole];

    return allowedRoles.filter((role) =>
      policyRoles.includes(role),
    );
  }, [allowedRoles, inviterRole]);

  /* --------------------------------------------------------------
     BRANCH VALIDATION
  -------------------------------------------------------------- */

  const branchIds = useMemo(
    () => branches.map((branch) => branch.id),
    [branches],
  );

  const schema = useMemo(
    () => createStaffInvitationSchema(branchIds),
    [branchIds],
  );

  const defaultRole = visibleRoles[0] ?? "STAFF";

  /* --------------------------------------------------------------
     FORM
  -------------------------------------------------------------- */

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormState>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      role: defaultRole,
      branchId: "",
    },
  });

  const form = useWatch({ control });

  const busy = loading || isSubmitting;

  const selectedBranch = branches.find(
    (branch) => branch.id === form.branchId,
  );

  const hasOneRole = visibleRoles.length === 1;

  const selectedRole = form.role as StaffRole;

  const roleIsAllowed = visibleRoles.includes(selectedRole);

  /* --------------------------------------------------------------
     PREVIEW VALIDATION
  -------------------------------------------------------------- */

  const canPreview =
    Boolean(form.fullName?.trim()) &&
    Boolean(form.phone?.trim()) &&
    Boolean(form.branchId) &&
    roleIsAllowed &&
    !errors.fullName &&
    !errors.phone &&
    !errors.email &&
    !errors.role &&
    !errors.branchId &&
    Boolean(selectedBranch);

  /* --------------------------------------------------------------
     RESET FORM WHEN OPENED
  -------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    reset({
      fullName: "",
      phone: "",
      email: "",
      role: defaultRole,
      branchId: branches.length === 1 ? branches[0].id : "",
    });

    setSubmitError(null);
  }, [open, reset, defaultRole, branches]);

  /* --------------------------------------------------------------
     KEEP ROLE VALID WHEN AUTHORIZATION CHANGES
  -------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    const currentRole = getValues("role") as StaffRole;

    if (!visibleRoles.includes(currentRole)) {
      setValue("role", defaultRole, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    void trigger("role");
  }, [
    open,
    visibleRoles,
    defaultRole,
    getValues,
    setValue,
    trigger,
  ]);

  /* --------------------------------------------------------------
     KEEP BRANCH SELECTION VALID
  -------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    const currentBranchId = getValues("branchId");

    if (
      currentBranchId &&
      !branchIds.includes(currentBranchId)
    ) {
      setValue("branchId", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    void trigger("branchId");
  }, [
    open,
    branchIds,
    getValues,
    setValue,
    trigger,
  ]);

  /* --------------------------------------------------------------
     CLOSE
  -------------------------------------------------------------- */

  const handleClose = useCallback(() => {
    if (busy) return;

    setSubmitError(null);
    onClose();
  }, [busy, onClose]);

  /* --------------------------------------------------------------
     SUBMISSION
  -------------------------------------------------------------- */

  const handleFormSubmit = async (data: FormState) => {
    if (busy) return;

    setSubmitError(null);

    // Recheck the role against both the page permissions and
    // the authenticated inviter's role policy.
    const policyRoles = ROLE_POLICY[inviterRole];

    const isAuthorizedRole =
      visibleRoles.includes(data.role as StaffRole) &&
      policyRoles.includes(data.role as StaffRole);

    if (!isAuthorizedRole) {
      setSubmitError(
        "You are not authorized to assign this role.",
      );
      return;
    }

    // Verify that the branch is in the permitted branch list.
    const branch = branches.find(
      (item) => item.id === data.branchId,
    );

    if (!branch) {
      setSubmitError("Select a valid branch.");
      return;
    }

    const payload: StaffInvitationData = {
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      role: data.role,
      branchId: branch.id,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to create the invitation.",
      );
    }
  };

  /* --------------------------------------------------------------
     VISIBILITY
  -------------------------------------------------------------- */

  if (!open || visibleRoles.length === 0) return null;

  const managerOnly =
    visibleRoles.length === 1 &&
    visibleRoles[0] === "MANAGER";

  const sheetTitle = managerOnly
    ? "Add Branch Manager"
    : "Add Team Member";

  const sheetSubtitle = managerOnly
    ? "Invite a manager to oversee a business branch."
    : "Invite a team member to your assigned branch.";

  /* ================================================================
     RENDER
  ================================================================ */

  return (
    <GlassSheet
      open={open}
      onClose={handleClose}
      title={sheetTitle}
      subtitle={sheetSubtitle}
      loading={busy}
      className="w-full sm:max-w-xl lg:max-w-2xl"
    >
      <form
        noValidate
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6 pb-4"
      >
        {/* SUBMISSION ERROR */}

        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* FULL NAME */}

        <section className="space-y-2">
          <label className={LABEL_CLASS}>Full name</label>

          <Controller
            control={control}
            name="fullName"
            render={({ field, fieldState }) => (
              <>
                <GlassInput
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  icon={<UserRound size={18} />}
                  placeholder="e.g. Musa Ibrahim"
                  disabled={busy}
                  className={[
                    FIELD_CLASS,
                    fieldState.error ? "!border-red-500/60" : "",
                  ].join(" ")}
                />

                <FieldError message={fieldState.error?.message} />
              </>
            )}
          />
        </section>

        {/* PHONE */}

        <section className="space-y-2">
          <label className={LABEL_CLASS}>Phone number</label>

          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <>
                <GlassInput
                  name={field.name}
                  value={field.value}
                  onChange={(event) => {
                    const digits = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 15);

                    field.onChange(digits);
                  }}
                  onBlur={field.onBlur}
                  icon={<Phone size={18} />}
                  placeholder="e.g. 08012345678"
                  disabled={busy}
                  className={[
                    FIELD_CLASS,
                    fieldState.error ? "!border-red-500/60" : "",
                  ].join(" ")}
                  inputMode="numeric"
                />

                <FieldError message={fieldState.error?.message} />

                <p className="px-1 text-[11px] text-gray-600">
                  Enter 10–15 digits.
                </p>
              </>
            )}
          />
        </section>

        {/* EMAIL */}

        <section className="space-y-2">
          <label className={LABEL_CLASS}>
            Email{" "}
            <span className="normal-case text-gray-700">
              optional
            </span>
          </label>

          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <>
                <GlassInput
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  icon={<Mail size={18} />}
                  placeholder="e.g. musa@example.com"
                  disabled={busy}
                  className={[
                    FIELD_CLASS,
                    fieldState.error ? "!border-red-500/60" : "",
                  ].join(" ")}
                  inputMode="email"
                />

                <FieldError message={fieldState.error?.message} />
              </>
            )}
          />
        </section>

        {/* ROLE */}

        <section className="space-y-3">
          <p className={LABEL_CLASS}>Assigned role</p>

          {hasOneRole ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-300">
                {(() => {
                  const Icon = ROLE_DETAILS[visibleRoles[0]].icon;
                  return <Icon size={20} />;
                })()}
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  {ROLE_DETAILS[visibleRoles[0]].title}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  This role is assigned by your access level.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleRoles.map((role) => (
                <RoleCard
                  key={role}
                  role={role}
                  selected={selectedRole === role}
                  disabled={busy}
                  onSelect={(selectedRole) => {
                    setValue("role", selectedRole, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              ))}
            </div>
          )}

          <FieldError message={errors.role?.message} />
        </section>

        {/* BRANCH */}

        <section className="space-y-2">
          <label htmlFor="staff-branch" className={LABEL_CLASS}>
            {branches.length === 1 ? "Assigned branch" : "Branch"}
          </label>

          <Controller
            control={control}
            name="branchId"
            render={({ field, fieldState }) => (
              <>
                <div className="relative">
                  <Building2
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <select
                    id="staff-branch"
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    disabled={
                      busy ||
                      branches.length === 0 ||
                      branches.length === 1
                    }
                    className={[
                      "h-13 w-full appearance-none rounded-2xl border bg-black/20 pl-12 pr-4 text-sm text-white outline-none",
                      fieldState.error
                        ? "border-red-500/60"
                        : "border-white/10",
                    ].join(" ")}
                  >
                    <option value="" className="bg-neutral-900">
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

                <FieldError message={fieldState.error?.message} />

                {branches.length === 0 && (
                  <p className="text-[11px] text-amber-400">
                    No permitted branch is available.
                  </p>
                )}
              </>
            )}
          />
        </section>

        {/* INVITATION PREVIEW */}

        {canPreview && selectedBranch && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <p className="text-sm font-semibold text-white">
              {form.fullName?.trim()}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {ROLE_DETAILS[selectedRole].title}
              {" • "}
              {selectedBranch.name}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {form.phone}
            </p>

            {form.email?.trim() && (
              <p className="mt-1 break-all text-xs text-gray-500">
                {form.email.trim()}
              </p>
            )}
          </div>
        )}

        {/* SUBMIT */}

        <GlassButton
          type="submit"
          disabled={
            busy ||
            branches.length === 0 ||
            visibleRoles.length === 0
          }
          className="h-13 w-full rounded-2xl font-semibold disabled:opacity-40"
        >
          {busy ? "Creating Invitation..." : "Send Invitation"}
        </GlassButton>
      </form>
    </GlassSheet>
  );
}

/* ================================================================
   ROLE CARD
================================================================ */

interface RoleCardProps {
  role: StaffRole;
  selected: boolean;
  disabled: boolean;
  onSelect: (role: StaffRole) => void;
}

function RoleCard({
  role,
  selected,
  disabled,
  onSelect,
}: RoleCardProps) {
  const details = ROLE_DETAILS[role];
  const Icon = details.icon;

  const isManager = role === "MANAGER";

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={() => onSelect(role)}
      className={[
        "relative overflow-hidden rounded-[22px] border p-4 text-left",
        "transition-all duration-200",
        selected
          ? isManager
            ? "border-amber-400/50 bg-amber-400/10 shadow-[0_0_35px_rgba(245,158,11,0.10)]"
            : "border-teal-400/50 bg-teal-400/10 shadow-[0_0_35px_rgba(20,184,166,0.10)]"
          : "border-white/10 bg-black/20 hover:bg-white/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
      ].join(" ")}
    >
      {selected && (
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute inset-x-0 top-0 h-px",
            isManager ? "bg-amber-300/50" : "bg-teal-300/50",
          ].join(" ")}
        />
      )}

      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            selected
              ? isManager
                ? "bg-amber-400/15 text-amber-300"
                : "bg-teal-400/15 text-teal-300"
              : "bg-white/5 text-gray-500",
          ].join(" ")}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            {details.title}
          </p>

          <p className="mt-1 text-[11px] text-gray-500">
            {details.description}
          </p>
        </div>
      </div>
    </button>
  );
}

/* ================================================================
   FIELD ERROR
================================================================ */

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className={FIELD_ERROR_CLASS}>
      <AlertCircle size={13} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
