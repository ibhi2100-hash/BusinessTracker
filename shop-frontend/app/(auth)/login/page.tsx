"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth.schema";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  ShieldCheck,
  Cloud,
  BarChart3,
  Lock,
} from "lucide-react";

import { useAuthStore } from "@/src/store/useAuthStore";
import { AuthService } from "@/src/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.setLogin);

  const [submit, setSubmit] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setSubmit(true);
      setServerError(null);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Login failed");
      }

      useAuthStore.getState().setUser(result.user);

      login(
        result.user,
        result.accessToken,
        result.expiresIn,
        result.branches,
        result.activeBranch.id
      );

      await AuthService.saveUser(result.user);

      if (!result.user.onboardingCompleted) {
        router.push("/onboarding/step1-business");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      setServerError(error?.message || "Login failed");
    } finally {
      setSubmit(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-green-500/20 blur-[120px]" />
        <div className="absolute bottom-[-120px] right-[-80px] h-[340px] w-[340px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">

        <div className="w-full max-w-md space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 backdrop-blur-xl">
              🔐 Secure Access
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>

            <p className="text-sm text-gray-400">
              Continue managing your business
            </p>
          </div>

          {/* Feature chips (mobile-first compressed) */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-gray-400">
            <Chip icon={<BarChart3 />} label="Analytics" />
            <Chip icon={<Cloud />} label="Offline" />
            <Chip icon={<ShieldCheck />} label="Secure" />
            <Chip icon={<Lock />} label="Session" />
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 shadow-[0_20px_80px_rgba(0,0,0,0.4)]">

            {/* Google Login */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium transition active:scale-[0.98] hover:bg-white/10"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] text-gray-500">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Error */}
            {serverError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                {serverError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

              <Input
                type="email"
                placeholder="Email address"
                register={register("email")}
                error={errors.email?.message}
              />

              <Input
                type="password"
                placeholder="Password"
                register={register("password")}
                error={errors.password?.message}
              />

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-green-400"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submit}
                className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 py-4 text-sm font-semibold shadow-[0_15px_50px_rgba(34,197,94,0.35)] transition active:scale-[0.98] disabled:opacity-60"
              >
                <span className="flex items-center justify-center gap-2">
                  {submit ? "Logging in..." : "Log in"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-400">
              Don’t have an account?
              <Link href="/register" className="ml-1 text-green-400">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------------- CHIP ---------------- */
function Chip({ icon, label }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
      <div className="mx-auto mb-1 h-4 w-4 text-green-400">{icon}</div>
      <div>{label}</div>
    </div>
  );
}

/* ---------------- INPUT ---------------- */
function Input({ register, error, ...props }: any) {
  return (
    <div>
      <input
        {...register}
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
      />
      {error && (
        <p className="mt-1 text-[11px] text-red-400">{error}</p>
      )}
    </div>
  );
}

/* ---------------- GOOGLE ICON ---------------- */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.8-5.8C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}