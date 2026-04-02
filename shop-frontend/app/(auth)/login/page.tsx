"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth.schema";
import { useRouter } from "next/navigation";
import { useAutoLogin } from "@/hooks/useAutoLogin";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { saveUser } from "@/offline/user/userRepository";
import { saveSession } from "@/offline/session/sessionRepository";
import { hydrateStores } from "@/offline/hydration/hydrationStore";
import { useState } from "react";



export default function LoginPage() {
  const [ submit, setSubmit ] =useState(false)
  const router = useRouter();
  const login = useAuthStore((state)=> state.setLogin)
  


  const {
    register,
    handleSubmit,
    formState: { errors},
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {

    try {
      setSubmit(true)
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
      login(result.user, result.accessToken, result.expiresIn, result.branches, result.activeBranch.id )
      // persist offline
            // 1️⃣ Persist to IndexedDB
      await saveUser(result.user);
      await saveSession({
        userId: result.user.id,
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      });
      // 2️⃣ Hydrate Zustand (from API payload)

       
      if (!result.user.onboardingCompleted) {
        router.push("/onboarding/step1-business");

      }
      else {
        router.push("/dashboard");
      }
      setSubmit(false)

    } catch (error: any) {
 console.log(error)
    }
  };
/*
  if (checkingSession) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Checking session...
    </div>
  );
}
*/
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Welcome Back</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <input
              {...register("email")}
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-2 border rounded-xl"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-xl"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submit}
            className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            {submit ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-600 font-medium">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
