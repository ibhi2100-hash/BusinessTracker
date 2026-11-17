
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { GlassCard } from "../../components/ui/GlassCard";
import { GlassIcon } from "../../components/ui/GlassIcon";
import { GlassButton } from "../../components/ui/GlassButton";
import { GlassInput } from "../../components/ui/GlassInput";

import { useBusinessContext } from "../../Biztru/context/BusinessContext";
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { toast } from "sonner";
import { BusinessEventTypes } from "@business/shared-types";

type BranchForm = {
  name: string;
  address: string;
  phone: string;
};

type InputChangeValue =
  | string
  | {
      target?: { value?: unknown };
      currentTarget?: { value?: unknown };
    };

const MIN_BRANCH_NAME_LENGTH = 2;
const MAX_BRANCH_NAME_LENGTH = 80;
const MAX_ADDRESS_LENGTH = 250;

// IMPORTANT:
// Replace these with the exact values supported by your branch
// creation command handler.
const BRANCH_CREATE_COMMAND_TYPE = "BRANCH_CREATE";
const BRANCH_COMMAND_MODE = "LIVE" as const;

function getInputValue(value: InputChangeValue): string {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const inputValue =
      value.currentTarget?.value ?? value.target?.value;

    if (typeof inputValue === "string") {
      return inputValue;
    }
  }

  return "";
}

function validatePhone(phone: string): boolean {
  if (!phone.trim()) return true;

  return /^\+?[\d\s()-]{7,20}$/.test(phone.trim());
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to create the branch. Please try again.";
}

export default function AddBranchPage() {
  const navigate = useNavigate();

  const { businessId } = useBusinessContext();
  const app = useApplication();

  const [form, setForm] = useState<BranchForm>({
    name: "",
    address: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const updateField = (field: keyof BranchForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) setError("");
  };

  const validateForm = (): string => {
    if (!businessId) {
      return "No active business was found. Please select a business first.";
    }

    const name = form.name.trim();
    const address = form.address.trim();
    const phone = form.phone.trim();

    if (!name) {
      return "Please enter a branch name.";
    }

    if (name.length < MIN_BRANCH_NAME_LENGTH) {
      return "Branch name must contain at least 2 characters.";
    }

    if (name.length > MAX_BRANCH_NAME_LENGTH) {
      return "Branch name cannot exceed 80 characters.";
    }

    if (address.length > MAX_ADDRESS_LENGTH) {
      return "Branch address cannot exceed 250 characters.";
    }

    if (!validatePhone(phone)) {
      return "Please enter a valid phone number.";
    }

    return "";
  };

  const handleCreateBranch = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  if (loading || success) return;

  const validationError = validateForm();

  if (validationError) {
    setError(validationError);
    return;
  }

  setLoading(true);
  setError("");

  try {
    const branchId = crypto.randomUUID();

    if (!app.branch?.createBranch) {
      throw new Error("Branch API is not available.");
    }

    await app.branch.createBranch({
      id: branchId,
      businessId,
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      phone: form.phone.trim() || undefined,
      type: BusinessEventTypes.BRANCH_CREATED,
      mode: "LIVE",
    });

    setSuccess(true);

    toast.success("Branch created successfully.");

    // Pass the newly created branch ID to the product allocation page.
    navigate(`/owner/branches/${branchId}/products`, {
      replace: true,
    });
  } catch (err) {
    setError(getErrorMessage(err));
    setLoading(false);
  }
};

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080d12] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Background effects */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white disabled:opacity-50"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </button>

          <div className="flex items-center gap-4">
            <GlassIcon size="lg" variant="primary">
              <Building2 size={25} />
            </GlassIcon>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Add New Branch
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Expand your business by creating another operating location.
              </p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <GlassCard variant="elevated" className="p-5 sm:p-8">
          <div className="mb-7">
            <h2 className="text-lg font-semibold">
              Branch information
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Enter the details of your new business location.
            </p>
          </div>

          <form onSubmit={handleCreateBranch} className="space-y-6">
            {/* Branch name */}
            <div>
              <label
                htmlFor="branch-name"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Branch name <span className="text-red-400">*</span>
              </label>

              <div className="relative">
                <Building2
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-500"
                />

                <GlassInput
                  value={form.name}
                  onChange={(value) =>
                    updateField("name", getInputValue(value))
                  }
                  placeholder="e.g. Wuse 2 Branch"
                  disabled={loading || success}
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {form.name.trim().length}/{MAX_BRANCH_NAME_LENGTH} characters
              </p>
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="branch-address"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Branch address
              </label>

              <div className="relative">
                <MapPin
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-500"
                />

                <GlassInput
                  value={form.address}
                  onChange={(value) =>
                    updateField("address", getInputValue(value))
                  }
                  placeholder="Enter the branch street address"
                  disabled={loading || success}
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                You can update this information later.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="branch-phone"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Branch phone number
              </label>

              <div className="relative">
                <Phone
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-500"
                />

                <GlassInput
                  value={form.phone}
                  onChange={(value) =>
                    updateField("phone", getInputValue(value))
                  }
                  placeholder="+234 800 000 0000"
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Parent business */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-3">
                <Building2
                  size={18}
                  className="mt-0.5 shrink-0 text-teal-400"
                />

                <div className="min-w-0">
                  <p className="text-xs text-slate-400">
                    Parent business
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-slate-200">
                    {businessId || "No active business selected"}
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-400"
                />

                <p className="text-sm text-red-300">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-teal-500/20 bg-teal-500/10 p-4"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-teal-400"
                />

                <div>
                  <p className="text-sm font-medium text-teal-300">
                    Branch created successfully.
                  </p>

                  <p className="mt-1 text-xs text-teal-200/70">
                    Your new branch has been submitted to the business system.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
              <GlassButton
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </GlassButton>

              <GlassButton
                variant="primary"
                disabled={loading || success || !businessId}
                icon={
                  loading ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Plus size={17} />
                  )
                }
              >
                {loading ? "Creating branch..." : "Create Branch"}
              </GlassButton>
            </div>

            {success && (
              <div className="flex justify-end">
                <GlassButton
                  variant="primary"
                  onClick={() => navigate("/owner-dashboard")}
                >
                  Return to dashboard
                </GlassButton>
              </div>
            )}
          </form>
        </GlassCard>

        <p className="mt-5 text-center text-xs text-slate-500">
          New branches belong to your selected business and can be managed
          from your owner dashboard.
        </p>
      </div>
    </div>
  );
}
