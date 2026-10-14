
import { z } from "zod";

const emailValidator = z.string().email();

export const createStaffInvitationSchema = (
  validBranchIds: readonly string[],
) =>
  z
    .object({
      fullName: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name cannot exceed 100 characters"),

      phone: z
        .string()
        .trim()
        .regex(
          /^\d{10,15}$/,
          "Enter a valid phone number with 10–15 digits",
        ),

      email: z
        .string()
        .trim()
        .refine(
          (value) =>
            value === "" || emailValidator.safeParse(value).success,
          "Enter a valid email address",
        ),

      role: z.enum(["STAFF", "MANAGER"], {
        errorMap: () => ({
          message: "Select a valid staff role",
        }),
      }),

      branchId: z
        .string()
        .trim()
        .min(1, "Please select a branch"),
    })
    .superRefine((data, ctx) => {
      if (
        data.branchId.length > 0 &&
        !validBranchIds.includes(data.branchId)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["branchId"],
          message: "Select a valid branch from the list",
        });
      }
    });

export type StaffInvitationData = z.infer<
  ReturnType<typeof createStaffInvitationSchema>
>;
