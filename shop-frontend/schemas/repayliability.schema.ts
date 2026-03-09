import { z } from "zod"
/**
 * Repay Liability Schema
 * Aligns with:
 * repayLiability(liabilityId, businessId, dto: RepayLiabilityDto)
 */
export const repayLiabilitySchema = z.object({
  amount: z
    .coerce.number()
    .positive("Repayment amount must be greater than zero"),

  paymentDate: z.preprocess(
    (val) => (val ? new Date(val as string) : new Date()),
    z.date()
  ),
});

export type RepayLiabilityInput =
  z.infer<typeof repayLiabilitySchema>;