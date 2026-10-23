
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  Building2,
  Clock3,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// These endpoints must be implemented in the backend.
const VERIFY_INVITATION_URL = `${API_URL}/employee-invitations/verify`;
const ACCEPT_INVITATION_URL = `${API_URL}/employee-invitations/accept`;

interface InvitationDetails {
  employeeName: string;
  email: string;
  businessName: string;
  branchName?: string | null;
  role: string;
  expiresAt: string;
}

interface SignupForm {
  password: string;
  confirmPassword: string;
}

type InvitationState =
  | "verifying"
  | "valid"
  | "invalid"
  | "expired"
  | "accepted"
  | "error";

export default function EmployeeSignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [invitationState, setInvitationState] =
    useState<InvitationState>("verifying");
  const [invitation, setInvitation] =
    useState<InvitationDetails | null>(null);
  const [pageError, setPageError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const passwordsMatch =
    Boolean(password) &&
    Boolean(confirmPassword) &&
    password === confirmPassword;

  const passwordsDoNotMatch =
    Boolean(confirmPassword) &&
    password !== confirmPassword;

  useEffect(() => {
    const controller = new AbortController();

    async function verifyInvitation() {
      if (!token) {
        setInvitationState("invalid");
        setPageError(
          "This invitation link is missing its security token."
        );
        return;
      }

      setInvitationState("verifying");
      setInvitation(null);
      setPageError("");

      try {
        const response = await fetch(
          `${VERIFY_INVITATION_URL}?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            credentials: "include",
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 410) {
            setInvitationState("expired");
            setPageError(
              result.message || "This invitation has expired."
            );
          } else if (
            response.status === 400 ||
            response.status === 401 ||
            response.status === 404 ||
            response.status === 409
          ) {
            setInvitationState("invalid");
            setPageError(
              result.message ||
                "This invitation is invalid, revoked, or already used."
            );
          } else {
            setInvitationState("error");
            setPageError(
              result.message ||
                "We could not verify this invitation. Please try again."
            );
          }
          return;
        }

        if (!result.invitation) {
          setInvitationState("error");
          setPageError(
            "The server returned an unexpected invitation response."
          );
          return;
        }

        setInvitation(result.invitation);
        setInvitationState("valid");
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setInvitationState("error");
        setPageError(
          "Unable to contact BizTru. Check your connection and retry."
        );
      }
    }

    void verifyInvitation();

    return () => controller.abort();
  }, [token]);

  const onSubmit = async (data: SignupForm) => {
    setPageError("");

    // Do not submit unless this page has verified the invitation.
    if (
      invitationState !== "valid" ||
      !invitation ||
      !token
    ) {
      setPageError(
        "Your invitation has not been verified. Please reload the link."
      );
      return;
    }

    if (data.password.length < 8) {
      setError("password", {
        type: "manual",
        message: "Use at least 8 characters for your password.",
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match.",
      });
      return;
    }

    try {
      const response = await fetch(ACCEPT_INVITATION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 410) {
          setInvitationState("expired");
        } else if (
          response.status === 400 ||
          response.status === 401 ||
          response.status === 404 ||
          response.status === 409
        ) {
          setInvitationState("invalid");
        }

        throw new Error(
          result.message ||
            "We could not complete your signup. The invitation may have expired."
        );
      }

      setInvitationState("accepted");

      // Do not assume the acceptance endpoint created a login session.
      // Send the employee to sign in unless the backend contract says
      // it explicitly creates a session.
      navigate("/login?invitation=accepted", { replace: true });
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Signup failed. Please try again."
      );
    }
  };

  const retryVerification = () => {
    // Reloading the same URL reruns token verification.
    window.location.reload();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-green-500/20 blur-[120px]" />
        <div className="absolute bottom-[-120px] right-[-80px] h-[320px] w-[320px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:50px_50px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          <header className="space-y-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 backdrop-blur-xl">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              BizTru · Secure invitation
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Join your team
            </h1>

            <p className="text-sm text-gray-400">
              Set up your employee account to get started.
            </p>
          </header>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-6">
            {invitationState === "verifying" && (
              <div
                className="flex flex-col items-center gap-3 py-12 text-center"
                role="status"
                aria-live="polite"
              >
                <Loader2 className="h-8 w-8 animate-spin text-green-400" />
                <h2 className="font-medium">
                  Verifying your invitation
                </h2>
                <p className="text-sm text-gray-400">
                  Checking that this invitation is valid and has not expired.
                </p>
              </div>
            )}

            {(invitationState === "invalid" ||
              invitationState === "expired" ||
              invitationState === "error") && (
              <div className="space-y-4 py-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                  <X className="h-6 w-6 text-red-400" />
                </div>

                <h2 className="text-lg font-semibold">
                  {invitationState === "expired"
                    ? "Invitation expired"
                    : invitationState === "invalid"
                      ? "Invitation unavailable"
                      : "Verification failed"}
                </h2>

                <p className="text-sm leading-6 text-gray-400">
                  {pageError}
                </p>

                {invitationState === "error" && (
                  <button
                    type="button"
                    onClick={retryVerification}
                    className="min-h-11 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15"
                  >
                    Try again
                  </button>
                )}

                <p className="text-xs leading-5 text-gray-500">
                  Ask your business administrator to issue a new invitation
                  if this link has expired, been revoked, or already used.
                </p>
              </div>
            )}

            {invitationState === "valid" && invitation && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.07] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-green-300">
                    <Check className="h-4 w-4" />
                    Invitation verified
                  </div>

                  <p className="text-lg font-semibold">
                    {invitation.employeeName}
                  </p>
                  <p className="mt-1 break-all text-sm text-gray-400">
                    {invitation.email}
                  </p>

                  <div className="mt-4 space-y-3 border-t border-white/10 pt-4 text-sm">
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                      <div>
                        <p className="text-gray-300">
                          {invitation.businessName}
                        </p>
                        {invitation.branchName && (
                          <p className="mt-1 text-xs text-gray-500">
                            {invitation.branchName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-4 w-4 text-green-400" />
                      <span className="text-gray-300">
                        Role: {invitation.role}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <span className="text-xs leading-5 text-gray-400">
                        Invitation expires{" "}
                        {new Date(invitation.expiresAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-xs text-gray-300"
                    >
                      Create password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        {...register("password", {
                          required: "Create a password.",
                          minLength: {
                            value: 8,
                            message: "Use at least 8 characters.",
                          },
                        })}
                        aria-invalid={Boolean(errors.password)}
                        className={`min-h-12 w-full rounded-2xl border bg-white/5 py-3 pl-4 pr-12 text-sm text-white outline-none transition placeholder:text-gray-500 focus:ring-2 ${
                          errors.password
                            ? "border-red-500/60 focus:ring-red-500/20"
                            : "border-white/10 focus:border-green-500 focus:ring-green-500/20"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((current) => !current)
                        }
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="h-[18px] w-[18px]" />
                        ) : (
                          <Eye className="h-[18px] w-[18px]" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1.5 text-xs text-red-400" role="alert">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-xs text-gray-300"
                    >
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Enter your password again"
                        {...register("confirmPassword", {
                          required: "Confirm your password.",
                          validate: (value) =>
                            value === password || "Passwords do not match.",
                        })}
                        aria-invalid={Boolean(errors.confirmPassword)}
                        className={`min-h-12 w-full rounded-2xl border bg-white/5 py-3 pl-4 pr-12 text-sm text-white outline-none transition placeholder:text-gray-500 focus:ring-2 ${
                          passwordsMatch
                            ? "border-green-500/70 focus:ring-green-500/20"
                            : errors.confirmPassword || passwordsDoNotMatch
                              ? "border-red-500/60 focus:ring-red-500/20"
                              : "border-white/10 focus:border-green-500 focus:ring-green-500/20"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((current) => !current)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirmation password"
                            : "Show confirmation password"
                        }
                        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-[18px] w-[18px]" />
                        ) : (
                          <Eye className="h-[18px] w-[18px]" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-xs text-red-400" role="alert">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                    {passwordsMatch && (
                      <p className="mt-2 flex items-center gap-2 text-xs text-green-400">
                        <Check className="h-4 w-4" />
                        Passwords match
                      </p>
                    )}
                  </div>

                  {pageError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs leading-5 text-red-400"
                    >
                      {pageError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-semibold shadow-[0_15px_50px_rgba(34,197,94,0.25)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-green-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Accept invitation
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {invitationState === "accepted" && (
              <div className="py-8 text-center">
                <Check className="mx-auto mb-3 h-10 w-10 text-green-400" />
                <h2 className="font-semibold">Invitation accepted</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Your account has been created. Continue to sign in.
                </p>
              </div>
            )}
          </section>

          <p className="px-4 text-center text-[10px] leading-5 text-gray-600">
            Your invitation grants access only to the business and role
            authorized by the inviter. Never share your invitation link.
          </p>

          <p className="text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-green-400 hover:text-green-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
