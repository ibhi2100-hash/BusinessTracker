
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Controller,
  useForm,
  useWatch,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  BriefcaseBusiness,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  AlertCircle,
} from "lucide-react";

import type { Branch } from "@business/shared-types";

import { GlassSheet } from "../ui/GlassSheet";
import { GlassInput } from "../ui/GlassInput";
import { GlassButton } from "../ui/GlassButton";

import {
  createStaffInvitationSchema,
  type StaffInvitationData,
} from "../../schemas/staff.schema";

export type StaffRole = "STAFF" | "MANAGER";

export type EmploymentStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "INVITED";

interface Props {
  open: boolean;
  branches: Branch[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    data: StaffInvitationData,
  ) => void | Promise<void>;
}

type FormState = StaffInvitationData;

const EMPTY_FORM: FormState = {
  fullName: "",
  phone: "",
  email: "",
  role: "STAFF",
  branchId: "",
};

const FIELD_CLASS =
  "h-13 rounded-2xl";

const FIELD_ERROR_CLASS =
  "mt-1.5 flex items-start gap-1.5 px-1 text-[11px] leading-4 text-red-400";

const LABEL_CLASS =
  "block text-xs font-medium uppercase tracking-wider text-gray-500";

export default function StaffInvitationSheet({
  open,
  branches,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [submitSucceeded, setSubmitSucceeded] =
    useState(false);

  const branchIds = useMemo(
    () => branches.map((branch) => branch.id),
    [branches],
  );

  const schema = useMemo(
    () => createStaffInvitationSchema(branchIds),
    [branchIds],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    clearErrors,
    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } = useForm<FormState>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: EMPTY_FORM,
  });

  const form = useWatch({ control });

  const busy = loading || isSubmitting;

  const selectedBranch = branches.find(
    (branch) => branch.id === form.branchId,
  );

  const isValidRole =
    form.role === "STAFF" ||
    form.role === "MANAGER";

  const canPreview =
    Boolean(form.fullName?.trim()) &&
    Boolean(form.phone?.trim()) &&
    Boolean(form.branchId) &&
    isValidRole &&
    !errors.fullName &&
    !errors.phone &&
    !errors.email &&
    !errors.role &&
    !errors.branchId &&
    Boolean(selectedBranch);

  /*
   * Reset the form when the sheet opens.
   *
   * The reset effect deliberately does not depend on the
   * branches array, preventing an ordinary branch-list
   * refresh from clearing data the user has entered.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    reset(EMPTY_FORM);
    setSubmitError(null);
    setSubmitSucceeded(false);
  }, [open, reset]);

  /*
   * Automatically assign the only available branch.
   * Never overwrite a branch the user has already selected.
   */
  useEffect(() => {
    if (!open || branches.length !== 1) {
      return;
    }

    if (!getValues("branchId")) {
      setValue("branchId", branches[0].id, {
        shouldValidate: true,
      });
    }
  }, [open, branches, getValues, setValue]);

  /*
   * If the branch list changes while the sheet is open,
   * immediately revalidate the selected branch.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const selectedId = getValues("branchId");

    if (selectedId) {
      void control._options.resolver;
      // The schema is also evaluated on submission.
      // Triggering validation is handled below through
      // setValue when the selection is changed.
    }
  }, [open, branchIds, control, getValues]);

  const handleClose = useCallback(() => {
    if (busy) {
      return;
    }

    reset(EMPTY_FORM);
    setSubmitError(null);
    setSubmitSucceeded(false);
    onClose();
  }, [busy, reset, onClose]);

  const chooseRole = useCallback(
    (role: StaffRole) => {
      if (busy) {
        return;
      }

      setSubmitError(null);
      setSubmitSucceeded(false);

      setValue("role", role, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [busy, setValue],
  );

  const handlePhoneChange = useCallback(
    (
      value: string,
      onChange: (value: string) => void,
    ) => {
      const digits = value
        .replace(/\D/g, "")
        .slice(0, 15);

      onChange(digits);
      setSubmitError(null);
      setSubmitSucceeded(false);
    },
    [],
  );

  const handleFormSubmit = async (
    data: FormState,
  ) => {
    if (busy) {
      return;
    }

    setSubmitError(null);
    setSubmitSucceeded(false);

    /*
     * Defense in depth: the schema validates the branch ID,
     * and this check ensures it still exists immediately
     * before invoking the submission callback.
     */
    const branchExists = branches.some(
      (branch) => branch.id === data.branchId,
    );

    if (!branchExists) {
      setValue("branchId", data.branchId, {
        shouldValidate: true,
        shouldTouch: true,
      });

      setSubmitError(
        "The selected branch is no longer available. Please select a valid branch.",
      );

      return;
    }

    const payload: StaffInvitationData = {
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      role: data.role,
      branchId: data.branchId,
    };

    try {
      await onSubmit(payload);
      setSubmitSucceeded(true);
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to create the invitation. Please try again.",
      );
    }
  };

  if (!open) {
    return null;
  }

  return (
    <GlassSheet
      open={open}
      onClose={handleClose}
      title="Add Staff"
      subtitle="Invite a team member to your business"
      loading={busy}
      className="w-full sm:max-w-xl lg:max-w-2xl xl:max-w-3xl"
    >
      <form
        noValidate
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-7 pb-4"
      >
        {/* =====================================================
            SERVER / SUBMISSION FEEDBACK
        ====================================================== */}

        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs leading-5 text-red-400"
          >
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0"
            />
            <span>{submitError}</span>
          </div>
        )}

        {submitSucceeded && (
          <div
            role="status"
            className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-3 text-xs leading-5 text-teal-300"
          >
            The submission handler completed successfully.
            Refresh the staff list or close the sheet as
            appropriate for your invitation workflow.
          </div>
        )}

        {/* =====================================================
            FULL NAME
        ====================================================== */}

        <section className="space-y-2">
          <label
            htmlFor="staff-full-name"
            className={LABEL_CLASS}
          >
            Full name
          </label>

          <Controller
            control={control}
            name="fullName"
            render={({ field, fieldState }) => (
              <>
                <GlassInput
                  name={field.name}
                  value={field.value}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ) => {
                    field.onChange(event);
                    setSubmitError(null);
                    setSubmitSucceeded(false);
                  }}
                  onBlur={field.onBlur}
                  icon={<UserRound size={18} />}
                  placeholder="e.g. Musa Ibrahim"
                  disabled={busy}
                  className={[
                    FIELD_CLASS,
                    fieldState.error
                      ? "!border-red-500/60"
                      : "",
                  ].join(" ")}
                  autoComplete="name"
                />

                <FieldError
                  id="staff-full-name-error"
                  message={fieldState.error?.message}
                />
              </>
            )}
          />
        </section>

        {/* =====================================================
            PHONE
        ====================================================== */}

        <section className="space-y-2">
          <label
            htmlFor="staff-phone"
            className={LABEL_CLASS}
          >
            Phone number
          </label>

          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <>
                <GlassInput
                  name={field.name}
                  value={field.value}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ) =>
                    handlePhoneChange(
                      event.target.value,
                      field.onChange,
                    )
                  }
                  onBlur={field.onBlur}
                  icon={<Phone size={18} />}
                  placeholder="e.g. 08012345678"
                  disabled={busy}
                  className={[
                    FIELD_CLASS,
                    fieldState.error
                      ? "!border-red-500/60"
                      : "",
                  ].join(" ")}
                  inputMode="numeric"
                  autoComplete="tel"
                />

                <FieldError
                  id="staff-phone-error"
                  message={fieldState.error?.message}
                />

                <p className="px-1 text-[11px] text-gray-600">
                  Enter 10–15 digits. This number identifies
                  the staff member for the invitation.
                </p>
              </>
            )}
          />
        </section>

        {/* =====================================================
            EMAIL
        ====================================================== */}

        <section className="space-y-2">
          <label
            htmlFor="staff-email"
            className={LABEL_CLASS}
          >
            Email
            <span className="ml-1 normal-case text-gray-700">
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
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ) => {
                    field.onChange(event);
                    setSubmitError(null);
                    setSubmitSucceeded(false);
                  }}
                  onBlur={field.onBlur}
                  icon={<Mail size={18} />}
                  placeholder="e.g. musa@example.com"
                  disabled={busy}
                  className={[
                    FIELD_CLASS,
                    fieldState.error
                      ? "!border-red-500/60"
                      : "",
                  ].join(" ")}
                  inputMode="email"
                  autoComplete="email"
                />

                <FieldError
                  id="staff-email-error"
                  message={fieldState.error?.message}
                />
              </>
            )}
          />
        </section>

        {/* =====================================================
            ROLE
        ====================================================== */}

        <section>
          <p className={`${LABEL_CLASS} mb-2`}>
            Role
          </p>

          <Controller
            control={control}
            name="role"
            render={({ field, fieldState }) => (
              <>
                <div
                  className="grid grid-cols-2 gap-3"
                  role="group"
                  aria-label="Staff role"
                  aria-invalid={Boolean(fieldState.error)}
                >
                  <RoleCard
                    role="STAFF"
                    selected={field.value === "STAFF"}
                    disabled={busy}
                    onSelect={chooseRole}
                  />

                  <RoleCard
                    role="MANAGER"
                    selected={field.value === "MANAGER"}
                    disabled={busy}
                    onSelect={chooseRole}
                  />
                </div>

                <FieldError
                  id="staff-role-error"
                  message={fieldState.error?.message}
                />
              </>
            )}
          />
        </section>

        {/* =====================================================
            BRANCH
        ====================================================== */}

        <section>
          <label
            htmlFor="staff-branch"
            className={`${LABEL_CLASS} mb-2`}
          >
            Branch
          </label>

          <Controller
            control={control}
            name="branchId"
            render={({ field, fieldState }) => (
              <>
                <div className="relative">
                  <Building2
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-500"
                  />

                  <select
                    id="staff-branch"
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                      setSubmitError(null);
                      setSubmitSucceeded(false);
                    }}
                    disabled={busy || branches.length === 0}
                    aria-invalid={Boolean(fieldState.error)}
                    aria-describedby={
                      fieldState.error
                        ? "staff-branch-error"
                        : branches.length === 0
                          ? "staff-branch-help"
                          : undefined
                    }
                    className={[
                      "h-13 w-full appearance-none rounded-2xl border",
                      "bg-black/20 pl-12 pr-4 text-sm text-white",
                      "outline-none transition focus:border-teal-400/40",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      fieldState.error
                        ? "border-red-500/60"
                        : "border-white/10",
                    ].join(" ")}
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

                <FieldError
                  id="staff-branch-error"
                  message={fieldState.error?.message}
                />

                {branches.length === 0 && (
                  <p
                    id="staff-branch-help"
                    className="mt-2 px-1 text-[11px] text-amber-400/80"
                  >
                    Create or load a branch before assigning
                    staff.
                  </p>
                )}
              </>
            )}
          />
        </section>

        {/* =====================================================
            INVITATION PREVIEW
        ====================================================== */}

        {canPreview && selectedBranch && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                <UserRound size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold text-white">
                  {form.fullName?.trim()}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {form.role === "MANAGER"
                    ? "Manager"
                    : "Staff"}
                  {" • "}
                  {selectedBranch.name}
                </p>

                {form.phone && (
                  <p className="mt-1 text-xs text-gray-500">
                    {form.phone}
                  </p>
                )}

                {form.email?.trim() && (
                  <p className="mt-1 break-all text-xs text-gray-500">
                    {form.email.trim()}
                  </p>
                )}

                <p className="mt-2 text-[11px] text-gray-600">
                  An invitation will be created for this
                  team member.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            ACTION
        ====================================================== */}

        <div className="pt-1">
          <GlassButton
            type="submit"
            className="h-13 w-full rounded-2xl font-semibold shadow-[0_8px_30px_rgba(255,255,255,0.06)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={busy}
          >
            {busy
              ? "Creating Invitation..."
              : "Send Invitation"}
          </GlassButton>
        </div>
      </form>
    </GlassSheet>
  );
}

/* =============================================================
   FIELD ERROR
============================================================= */

interface FieldErrorProps {
  id: string;
  message?: string;
}

function FieldError({
  id,
  message,
}: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className={FIELD_ERROR_CLASS}
    >
      <AlertCircle
        size={13}
        className="mt-0.5 shrink-0"
      />
      <span>{message}</span>
    </p>
  );
}

/* =============================================================
   ROLE CARD
============================================================= */

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
  const isStaff = role === "STAFF";

  const Icon = isStaff
    ? BriefcaseBusiness
    : ShieldCheck;

  const title = isStaff ? "Staff" : "Manager";

  const description = isStaff
    ? "Sales & daily operations"
    : "Branch operations";

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
          ? isStaff
            ? "border-teal-400/50 bg-teal-400/10 shadow-[0_0_35px_rgba(20,184,166,0.10)]"
            : "border-amber-400/50 bg-amber-400/10 shadow-[0_0_35px_rgba(245,158,11,0.10)]"
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
            isStaff
              ? "bg-teal-300/50"
              : "bg-amber-300/50",
          ].join(" ")}
        />
      )}

      <div className="flex items-center gap-3">
        <div
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            selected
              ? isStaff
                ? "bg-teal-400/15 text-teal-300"
                : "bg-amber-400/15 text-amber-300"
              : "bg-white/5 text-gray-500",
          ].join(" ")}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            {title}
          </p>

          <p className="mt-1 text-[11px] text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
