import { useMemo } from "react";

export const useDepreciationPreview = (
  purchaseCost: number,
  quantity: number,
  usefulLifeMonths: number,
  salvageValue: number = 0
) => {
  return useMemo(() => {
    if (!purchaseCost || !quantity || !usefulLifeMonths)
      return null;

    const totalCost = purchaseCost * quantity;
    const depreciable = totalCost - salvageValue;
    const monthly = depreciable / usefulLifeMonths;

    return {
      totalCost,
      monthlyDepreciation: monthly,
    };
  }, [purchaseCost, quantity, usefulLifeMonths, salvageValue]);
};