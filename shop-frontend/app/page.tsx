"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Wallet,
  Boxes,
  ShieldCheck,
  Smartphone,
  TrendingUp,
} from "lucide-react";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Registered", reg))
        .catch((err) => console.error("SW Error", err));
    }
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      {/* ================= BACKGROUND ================= */}

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="
            absolute
            top-[-200px]
            left-1/2
            h-[500px]
            w-[500px]
            -translate-x-1/2
            rounded-full
            bg-green-500/20
            blur-[140px]
            animate-pulse
          "
        />

        <div
          className="
            absolute
            bottom-[-200px]
            right-[-100px]
            h-[450px]
            w-[450px]
            rounded-full
            bg-cyan-500/20
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.04]
            bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
            bg-[size:50px_50px]
          "
        />
      </div>

      {/* ================= CONTENT ================= */}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-5 sm:px-6">
        {/* ================= HEADER ================= */}

        <header className="flex items-center justify-between py-5 sm:py-8">
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-green-400
                to-emerald-600
                shadow-lg
              "
            >
              <TrendingUp className="h-5 w-5" />
            </div>

            <span className="font-semibold">
              BusinessOS
            </span>
          </div>

          <button
            onClick={() => router.push("/register")}
            className="
              rounded-full
              border
              border-white/10
              bg-white/5
              px-4
              py-2
              text-sm
              backdrop-blur-xl
            "
          >
            Sign Up
          </button>
        </header>

        {/* ================= HERO ================= */}

        <section className="flex flex-1 flex-col items-center justify-center text-center py-10 sm:py-20">
          <div
            className="
              mb-5
              rounded-full
              border
              border-white/10
              bg-white/5
              px-4
              py-2
              text-xs
              sm:text-sm
              backdrop-blur-xl
            "
          >
            ✨ Offline First • Built For SMEs
          </div>

          <h1
            className="
              max-w-5xl
              text-4xl
              font-bold
              leading-tight
              sm:text-5xl
              lg:text-7xl
            "
          >
            Manage your business
            <span
              className="
                block
                bg-gradient-to-r
                from-green-400
                via-emerald-300
                to-cyan-400
                bg-clip-text
                text-transparent
              "
            >
              from anywhere
            </span>
          </h1>

          <p
            className="
              mt-5
              max-w-2xl
              text-base
              text-gray-400
              sm:text-lg
            "
          >
            Inventory, sales, expenses, cashflow,
            profit tracking and analytics in one
            powerful platform designed for modern
            African businesses.
          </p>

          {/* CTA */}

          <div
            className="
              mt-8
              flex
              w-full
              max-w-md
              flex-col
              gap-3
              sm:flex-row
              sm:justify-center
            "
          >
            <button
              onClick={() => router.push("/register")}
              className="
                group
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-gradient-to-r
                from-green-500
                to-emerald-600
                px-6
                py-4
                font-medium
                shadow-[0_20px_60px_rgba(34,197,94,0.35)]
                transition-all
              "
            >
              Get Started

              <ArrowRight
                className="
                  h-4
                  w-4
                  transition
                  group-hover:translate-x-1
                "
              />
            </button>

            <button
              className="
                flex-1
                rounded-2xl
                border
                border-white/10
                bg-white/5
                px-6
                py-4
                backdrop-blur-xl
              "
            >
              Watch Demo
            </button>
          </div>

          {/* ================= STATS ================= */}

          <div
            className="
              mt-12
              grid
              w-full
              max-w-5xl
              grid-cols-1
              gap-3
              sm:grid-cols-3
            "
          >
            <StatCard
              value="24/7"
              label="Offline Capability"
            />

            <StatCard
              value="100%"
              label="Business Visibility"
            />

            <StatCard
              value="Real-Time"
              label="Live Analytics"
            />
          </div>
        </section>

        {/* ================= FEATURES ================= */}

        <section className="pb-16 sm:pb-24">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold">
              Everything You Need
            </h2>

            <p className="mt-3 text-gray-400">
              Run your business from a single app.
            </p>
          </div>

          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            <FeatureCard
              icon={<Boxes size={22} />}
              title="Inventory"
              description="Track products and stock levels instantly."
            />

            <FeatureCard
              icon={<Wallet size={22} />}
              title="Sales"
              description="Record every transaction online or offline."
            />

            <FeatureCard
              icon={<BarChart3 size={22} />}
              title="Analytics"
              description="Understand profit and performance."
            />

            <FeatureCard
              icon={<ShieldCheck size={22} />}
              title="Secure"
              description="Business data stays protected."
            />

            <FeatureCard
              icon={<Smartphone size={22} />}
              title="Mobile First"
              description="Optimized for phones and tablets."
            />

            <FeatureCard
              icon={<TrendingUp size={22} />}
              title="Growth"
              description="Scale with better decisions."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-5
        backdrop-blur-xl
      "
    >
      <h3 className="text-2xl font-bold">
        {value}
      </h3>

      <p className="mt-1 text-sm text-gray-400">
        {label}
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        group
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-6
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:bg-white/10
      "
    >
      <div
        className="
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-green-500/10
          text-green-400
        "
      >
        {icon}
      </div>

      <h3 className="mb-2 text-lg font-semibold">
        {title}
      </h3>

      <p className="text-sm text-gray-400">
        {description}
      </p>
    </div>
  );
}