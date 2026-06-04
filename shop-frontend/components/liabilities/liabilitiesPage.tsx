"use client";

import { Landmark } from "lucide-react";

import { CreateLiabilityForm } from "./createLiabilityForm";
import { LiabilityList } from "./liabilityList";

import { PageHeader } from "@/components/ui/PageHeader";

interface Props {
  mode: "OPENING" | "LIVE";
  onComplete?: () => void;
}

export default function LiabilitiesPage({
  mode,
  onComplete,
}: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-32 space-y-6">
      <PageHeader
        title="Liabilities"
        subtitle="Track loans, debts and repayment progress."
        action={<Landmark />}
      />

      <CreateLiabilityForm
        mode={mode}
        onComplete={onComplete}
      />

      <LiabilityList />
    </div>
  );
}