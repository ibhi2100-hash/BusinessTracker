

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema
} from "../../lib/validations/auth.schema"

import type { LoginInput } from "../../lib/validations/auth.schema";

import { Link, useNavigate } from "react-router-dom";


import {
  ArrowRight,
  ShieldCheck,
  Cloud,
  BarChart3,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { useAuthStore } from "../../Biztru/store/useAuthStore"
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";

export default function LoginPage() {
  const app = useApplication();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.setLogin);

  const [submit, setSubmit] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setSubmit(true);
      setServerError(null);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Login failed");
      }

      /*
       * ---------------------------------------------------------
       * 1. Save authentication/session information
       * ---------------------------------------------------------
       */

      await app.client.services.registration.register(result);

      await app.client.services.registration.saveSession(result);

      await app.client.services.registration.saveApplicationState(
        result.user.id
      );

      /*
       * ---------------------------------------------------------
       * 2. Update React authentication state
       * ---------------------------------------------------------
       */

      login(
        result.user,
        result.accessToken,
        result.expiresIn
      );

      /*
       * ---------------------------------------------------------
       * 3. Determine onboarding state
       * ---------------------------------------------------------
       */

      if (!result.user.businessId) {
        navigate("/onboarding/step1-business");
        return;
      }

      if (!result.user.onboardingCompleted) {
        navigate("/onboard");
        return;
      }

      /*
       * ---------------------------------------------------------
       * 4. Bootstrap local business replica
       * ---------------------------------------------------------
       */

      if (!result.user.branchId) {
        throw new Error(
          "Your business is configured but no active branch is assigned."
        );
      }

      await app.business.BootstrapBusiness({
        businessId: result.user.businessId,
        branchId: result.user.branchId,
        accessToken: result.accessToken,
      });

      /*
       * ---------------------------------------------------------
       * 5. Dashboard
       * ---------------------------------------------------------
       */

      navigate("/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);

      setServerError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setSubmit(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-green-500/20 blur-[120px]" />

        <div className="absolute bottom-[-120px] right-[-80px] h-[340px] w-[340px] rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:50px_50px] opacity-[0.04]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <header className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 backdrop-blur-xl">
              <span aria-hidden="true">🔐</span>
              Secure Access
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>

            <p className="text-sm text-gray-400">
              Continue managing your business
            </p>
          </header>

          {/* Feature chips */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-gray-400">
            <Chip
              icon={<BarChart3 />}
              label="Analytics"
            />

            <Chip
              icon={<Cloud />}
              label="Offline"
            />

            <Chip
              icon={<ShieldCheck />}
              label="Secure"
            />

            <Chip
              icon={<Lock />}
              label="Session"
            />
          </div>

          {/* Login card */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
            {/* Google Login */}
            <button
              type="button"
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-green-500/40 active:scale-[0.98]"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div
              className="my-5 flex items-center gap-4"
              role="separator"
              aria-label="Or continue with email"
            >
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] text-gray-500">
                OR
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Server error */}
            {serverError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs leading-5 text-red-400"
              >
                {serverError}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-3"
            >
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                autoComplete="email"
                inputMode="email"
                register={register("email")}
                error={errors.email?.message}
              />

              <PasswordInput
                id="password"
                placeholder="Password"
                autoComplete="current-password"
                register={register("password")}
                error={errors.password?.message}
                visible={showPassword}
                onToggleVisibility={() =>
                  setShowPassword((current) => !current)
                }
              />

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="rounded text-xs text-green-400 transition hover:text-green-300 hover:underline focus:outline-none focus:ring-2 focus:ring-green-500/40"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submit}
                className="mt-2 flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-semibold shadow-[0_15px_50px_rgba(34,197,94,0.35)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2 focus:ring-offset-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
              >
                <span className="flex items-center justify-center gap-2">
                  {submit ? "Logging in..." : "Log in"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-400">
              <span>Don’t have an account?</span>

              <Link
                to="/register"
                className="ml-1 font-medium text-green-400 underline-offset-4 transition hover:text-green-300 hover:underline focus:outline-none focus:ring-2 focus:ring-green-500/40"
              >
                Sign up
              </Link>
            </div>
          </section>

          {/* Security note */}
          <p className="px-4 text-center text-[10px] leading-5 text-gray-600">
            Your password remains hidden unless you choose to
            reveal it.
          </p>
        </div>
      </div>
    </main>
  );
}

/* ================================================================
   FEATURE CHIP
================================================================ */

interface ChipProps {
  icon: React.ReactNode;
  label: string;
}

function Chip({ icon, label }: ChipProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
      <div className="mx-auto mb-1 flex h-4 w-4 items-center justify-center text-green-400">
        {icon}
      </div>

      <div>{label}</div>
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
          "outline-none transition",
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
   PASSWORD INPUT WITH VISIBILITY TOGGLE
================================================================ */

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  register: any;
  error?: string;
  visible: boolean;
  onToggleVisibility: () => void;
}

function PasswordInput({
  register,
  error,
  visible,
  onToggleVisibility,
  id,
  ...props
}: PasswordInputProps) {
  const hasError = Boolean(error);

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
            "bg-white/5 py-3 pl-4 pr-12",
            "text-sm text-white",
            "placeholder:text-gray-500",
            "outline-none transition",
            "focus:ring-2",
            hasError
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
              : "border-white/10 focus:border-green-500 focus:ring-green-500/20",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500/40 active:scale-95"
        >
          {visible ? (
            <EyeOff
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          ) : (
            <Eye
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          )}
        </button>
      </div>

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