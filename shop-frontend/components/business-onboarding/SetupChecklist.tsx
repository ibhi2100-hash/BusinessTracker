"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useBusinessSetupStore } from "@/store/useBusinessSetupStore";
import { useRouter } from "next/navigation";
import { useOnboardingStatus } from "@/hooks/useSetUpStatus";
import { da } from "zod/v4/locales";


export const SetupChecklist = () => {
  const router = useRouter();
  const {
    hasOpeningCash,
    hasInventory,
    hasAssets,
    hasLiabilities,
  } = useBusinessSetupStore();
const { data } = useOnboardingStatus(); 
  const items = [
    {
      label: "Add Opening Cash",
      done: data?.steps.openingCash,
      route: "/onboarding-opening-cash",
    },
    {
      label: "Upload Inventory",
      done: data?.steps.inventory,
      route: "/onboarding-inventory",
    },
    {
      label: "Add Assets",
      done: data?.steps.assets,
      route: "/onboasrding/assets",
    },
    {
      label: "Add Liabilities",
      done: data?.steps.liabilities,
      route: "/onboarding/liabilities",
    },
  ];

  return (
    <Card className="space-y-4">
      {items.map((item) => (
        <div
          key={item.label}
          onClick={() => router.push(item.route)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {item.done ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-sm">{item.label}</span>
          </div>
          <span className="text-xs text-primary">
            {item.done ? "Completed" : "Add"}
          </span>
        </div>
      ))}
    </Card>
  );
};