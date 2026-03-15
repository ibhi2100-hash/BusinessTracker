// app/onboard/layout.tsx
"use client";

import { ReactNode } from "react";
import { OnboardingHeader } from "@/components/business-onboarding/OnboardingHeader";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OnboardingHeader />
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}