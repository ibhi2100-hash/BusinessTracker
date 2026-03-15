"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useBusinessSetupStore } from "@/store/useBusinessSetupStore";
import { useBusinessStatusStore } from "@/store/useBusinessStatusStore";


export const SetupChecklist = () => {
  const router = useRouter();

  const hydrated = useBusinessStatusStore(s => s.isHydrated);  
  const steps = useBusinessStatusStore(s => s.steps);
  
  const items = [
    {
      label: "Upload Inventory",
      done: steps?.inventory,
      route: "/onboarding-inventory",
    },
    {
      label: "Add Opening Cash",
      done: steps?.openingCash,
      route: "/onboarding-opening-cash",
    },
    {
      label: "Add Assets",
      done: steps?.assets,
      route: "/onboarding-assets",
    },
    {
      label: "Add Liabilities",
      done: steps?.liabilities,
      route: "/onboarding-liabilities",
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