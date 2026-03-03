"use client";

import { useState } from "react";
import { Rocket, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardContent } from "../ui/cardContent";
import { useActivateBusiness } from "@/hooks/useActivateBusiness";

export const BusinessActivationPanel = () => {
  const [confirm, setConfirm] = useState(false);
  const { mutate: activate, isPending } = useActivateBusiness();

  const handleActivate = () => {
    if (!confirm) return;
    activate();
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-4">
      <Card className="rounded-2xl shadow-lg border-none">
        <CardContent className="p-6 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Rocket className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-xl font-semibold">
              Start Operating Business
            </h1>
            <p className="text-sm text-muted-foreground">
              You’ve completed your setup. Activate your business to begin real transactions.
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-3 text-sm">

            <ChecklistItem label="Stock at Hand Added" />
            <ChecklistItem label="Opening Cash Recorded" />
            <ChecklistItem label="Assets Added" />
            <ChecklistItem label="Liabilities Added" />

          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <p>
              This action is irreversible. After activation, all transactions
              will affect real financial records.
            </p>
          </div>

          {/* Confirmation */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={confirm}
              onChange={(e) => setConfirm(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs">
              I understand and want to activate my business
            </span>
          </div>

          {/* Button */}
          <Button
            onClick={handleActivate}
            disabled={!confirm || isPending}
            className="w-full rounded-xl"
          >
            {isPending ? "Activating..." : "🚀 Activate Business"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

const ChecklistItem = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2">
    <CheckCircle2 className="w-4 h-4 text-green-500" />
    <span>{label}</span>
  </div>
);