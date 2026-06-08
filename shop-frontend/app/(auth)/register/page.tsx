"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth.schema";
import { AuthRepo } from "@/src/repositories/auth/authRepo"
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowRight,
  ShieldCheck,
  Cloud,
  BarChart3,
} from "lucide-react";

import { AuthService } from "@/src/services/authService";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      localStorage.setItem("accessToken", result.accessToken);
      const authRepo = new AuthRepo(result.user.id);

      await AuthService.saveUser(result.user);
      await authRepo.saveAuth({
        user: result.user,
        business: result.business,
        branches: result.branches,
        activeBranch: result.activeBranch,
      });

      router.push("/step1-business");
    } catch (error: any) {
      setServerError(error?.message || "Something went wrong");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-green-500/20 blur-[120px]" />
        <div className="absolute bottom-[-120px] right-[-80px] h-[320px] w-[320px] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">

        <div className="w-full max-w-md space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 backdrop-blur-xl">
              ✨ BusinessOS
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              Create your account
            </h1>

            <p className="text-sm text-gray-400">
              Start tracking your business in minutes
            </p>
          </div>

          {/* Features (compact mobile-first row) */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-gray-400">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <BarChart3 className="mx-auto mb-1 h-4 w-4 text-green-400" />
              Analytics
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <Cloud className="mx-auto mb-1 h-4 w-4 text-green-400" />
              Offline
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-green-400" />
              Secure
            </div>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 shadow-[0_20px_80px_rgba(0,0,0,0.4)]">

            {/* Google */}
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
                placeholder="Full name"
                register={register("name")}
                error={errors.name?.message}
              />

              <Input
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

              <Input
                type="password"
                placeholder="Confirm password"
                register={register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 py-4 text-sm font-semibold shadow-[0_15px_50px_rgba(34,197,94,0.35)] transition active:scale-[0.98] disabled:opacity-60"
              >
                <span className="flex items-center justify-center gap-2">
                  {isSubmitting ? "Creating..." : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-400">
              Already have an account?
              <Link href="/login" className="ml-1 text-green-400">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
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