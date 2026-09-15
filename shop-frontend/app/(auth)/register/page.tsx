"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth.schema";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  ShieldCheck,
  Cloud,
  BarChart3,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
} from "lucide-react";

import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";

export default function RegisterPage() {
  const router = useRouter();
  const app = useApplication();

  const [serverError, setServerError] = useState<string | null>(null);

  /*
   * Visibility is intentionally kept separate for each password field.
   *
   * This gives the user precise control:
   * - Password can be revealed independently.
   * - Confirm password can be revealed independently.
   */
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  /*
   * Watch only the two fields required for password confirmation.
   * The actual values remain managed by react-hook-form.
   */
  const password = useWatch({
    control,
    name: "password",
  });

  const confirmPassword = useWatch({
    control,
    name: "confirmPassword",
  });

  /*
   * Only show matching state after the user has entered something
   * into the confirmation field.
   */
  const passwordsMatch =
    Boolean(password) &&
    Boolean(confirmPassword) &&
    password === confirmPassword;

  const passwordsDoNotMatch =
    Boolean(confirmPassword) &&
    Boolean(password) &&
    password !== confirmPassword;

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Registration failed");
      }

      await app.client.services.registration.register(result);

      await app.client.services.registration.saveSession(result);

      await app.client.services.registration.saveApplicationState(
        result.user.id
      );

      router.push("/step1-business");
    } catch (error: unknown) {
      /*
       * IMPORTANT:
       * Do not `throw error` before setServerError().
       * Your previous implementation made the following code unreachable.
       */
      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* ------------------------------------------------------------
          BACKGROUND
      ------------------------------------------------------------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-green-500/20 blur-[120px]" />

        <div className="absolute bottom-[-120px] right-[-80px] h-[320px] w-[320px] rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* ------------------------------------------------------------
          PAGE CONTAINER
      ------------------------------------------------------------- */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* --------------------------------------------------------
              HEADER
          --------------------------------------------------------- */}
          <header className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 backdrop-blur-xl">
              <span aria-hidden="true">✨</span>
              BusinessOS
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Create your account
            </h1>

            <p className="text-sm text-gray-400">
              Start tracking your business in minutes
            </p>
          </header>

          {/* --------------------------------------------------------
              FEATURES
          --------------------------------------------------------- */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-gray-400">
            <Feature
              icon={<BarChart3 className="mx-auto mb-1 h-4 w-4 text-green-400" />}
              label="Analytics"
            />

            <Feature
              icon={<Cloud className="mx-auto mb-1 h-4 w-4 text-green-400" />}
              label="Offline"
            />

            <Feature
              icon={
                <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-green-400" />
              }
              label="Secure"
            />
          </div>

          {/* --------------------------------------------------------
              CARD
          --------------------------------------------------------- */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-6">
            {/* ------------------------------------------------------
                GOOGLE
            ------------------------------------------------------- */}
            <button
              type="button"
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/40 active:scale-[0.98]"
            >
              <GoogleIcon />

              <span>Continue with Google</span>
            </button>

            {/* ------------------------------------------------------
                DIVIDER
            ------------------------------------------------------- */}
            <div
              className="my-5 flex items-center gap-4"
              role="separator"
              aria-label="Or continue with email"
            >
              <div className="h-px flex-1 bg-white/10" />

              <span className="text-[11px] text-gray-500">OR</span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* ------------------------------------------------------
                SERVER ERROR
            ------------------------------------------------------- */}
            {serverError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs leading-5 text-red-400"
              >
                {serverError}
              </div>
            )}

            {/* ------------------------------------------------------
                FORM
            ------------------------------------------------------- */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              {/* NAME */}
              <Input
                id="name"
                type="text"
                placeholder="Full name"
                autoComplete="name"
                register={register("name")}
                error={errors.name?.message}
              />

              {/* EMAIL */}
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                autoComplete="email"
                inputMode="email"
                register={register("email")}
                error={errors.email?.message}
              />

              {/* ----------------------------------------------------
                  PASSWORD
              ----------------------------------------------------- */}
              <PasswordInput
                id="password"
                placeholder="Password"
                autoComplete="new-password"
                register={register("password")}
                error={errors.password?.message}
                visible={showPassword}
                onToggleVisibility={() =>
                  setShowPassword((current) => !current)
                }
              />

              {/* ----------------------------------------------------
                  CONFIRM PASSWORD
              ----------------------------------------------------- */}
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm password"
                autoComplete="new-password"
                register={register("confirmPassword")}
                error={
                  errors.confirmPassword?.message ||
                  (passwordsDoNotMatch ? "Passwords do not match" : undefined)
                }
                visible={showConfirmPassword}
                onToggleVisibility={() =>
                  setShowConfirmPassword((current) => !current)
                }
                status={
                  passwordsMatch
                    ? "match"
                    : passwordsDoNotMatch
                      ? "mismatch"
                      : undefined
                }
              />

              {/* ----------------------------------------------------
                  PASSWORD MATCH CONFIRMATION
              ----------------------------------------------------- */}
              {passwordsMatch && (
                <div
                  className="flex items-center gap-2 px-1 text-xs text-green-400"
                  role="status"
                  aria-live="polite"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                    <Check className="h-3.5 w-3.5" />
                  </span>

                  <span>Passwords match</span>
                </div>
              )}

              {/* ----------------------------------------------------
                  SUBMIT
              ----------------------------------------------------- */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-semibold shadow-[0_15px_50px_rgba(34,197,94,0.35)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2 focus:ring-offset-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
              >
                <span className="flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* ------------------------------------------------------
                FOOTER
            ------------------------------------------------------- */}
            <div className="mt-6 text-center text-xs text-gray-400">
              <span>Already have an account?</span>

              <Link
                href="/login"
                className="ml-1 font-medium text-green-400 underline-offset-4 transition hover:text-green-300 hover:underline focus:outline-none focus:ring-2 focus:ring-green-500/40"
              >
                Sign in
              </Link>
            </div>
          </section>

          {/* --------------------------------------------------------
              SECURITY NOTE
          --------------------------------------------------------- */}
          <p className="px-4 text-center text-[10px] leading-5 text-gray-600">
            Your password is securely transmitted over an encrypted
            connection and is never displayed in plain text unless you
            explicitly choose to reveal it.
          </p>
        </div>
      </div>
    </main>
  );
}

/* ================================================================
   FEATURE
================================================================ */

interface FeatureProps {
  icon: React.ReactNode;
  label: string;
}

function Feature({ icon, label }: FeatureProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
      {icon}
      {label}
    </div>
  );
}

/* ================================================================
   STANDARD INPUT
================================================================ */

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  register: any;
  error?: string;
}

function Input({
  register,
  error,
  id,
  ...props
}: InputProps) {
  return (
    <div>
      <input
        id={id}
        {...register}
        {...props}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          "min-h-12 w-full rounded-2xl border",
          "bg-white/5 px-4 py-3",
          "text-sm text-white",
          "placeholder:text-gray-500",
          "outline-none",
          "transition",
          "focus:ring-2",
          error
            ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
            : "border-white/10 focus:border-green-500 focus:ring-green-500/20",
        ].join(" ")}
      />

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 px-1 text-[11px] leading-4 text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ================================================================
   PASSWORD INPUT
================================================================ */

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  register: any;
  error?: string;
  visible: boolean;
  onToggleVisibility: () => void;
  status?: "match" | "mismatch";
}

function PasswordInput({
  register,
  error,
  visible,
  onToggleVisibility,
  status,
  id,
  ...props
}: PasswordInputProps) {
  const hasError = Boolean(error);

  const borderClass =
    status === "match"
      ? "border-green-500/70 focus:border-green-500 focus:ring-green-500/20"
      : status === "mismatch" || hasError
        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
        : "border-white/10 focus:border-green-500 focus:ring-green-500/20";

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          {...register}
          {...props}
          type={visible ? "text" : "password"}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={[
            "min-h-12 w-full rounded-2xl border",
            "bg-white/5",
            "py-3 pl-4 pr-12",
            "text-sm text-white",
            "placeholder:text-gray-500",
            "outline-none",
            "transition",
            "focus:ring-2",
            borderClass,
          ].join(" ")}
        />

        {/* ----------------------------------------------------------
            VISIBILITY TOGGLE
        ----------------------------------------------------------- */}
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500/40 active:scale-95"
        >
          {visible ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1 px-1 text-[11px] leading-4 text-red-400"
        >
          <X className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ================================================================
   GOOGLE ICON
================================================================ */

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.8-5.8C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}