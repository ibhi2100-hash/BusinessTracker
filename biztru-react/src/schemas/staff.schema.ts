import { z } from "zod";

const emailValidator = z.string().email();

const staffRoleSchema = z.enum(["STAFF", "MANAGER"], {
  message: "Select a valid staff role",
});

export const createStaffInvitationSchema = (
  validBranchIds: readonly string[],
) =>
  z
    .object({
      fullName: z
        .string({
          message: "Full name is required",
        })
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name cannot exceed 100 characters"),

      phone: z
        .string({
          message: "Phone number is required",
        })
        .trim()
        .regex(
          /^\d{11}$/,
          "Enter a valid phone number with 11 digits",
        ),

      email: z
        .string()
        .trim()
        .refine(
          (value) =>
            value === "" || emailValidator.safeParse(value).success,
          "Enter a valid email address",
        ),

      role: staffRoleSchema,

      branchId: z
        .string({
          message: "Please select a branch",
        })
        .trim()
        .min(1, "Please select a branch"),
    })
    .superRefine((data, ctx) => {
      if (
        data.branchId.length > 0 &&
        !validBranchIds.includes(data.branchId)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["branchId"],
          message: "Select a valid branch from the list",
        });
      }
    });

export type StaffInvitationData = z.infer<
  ReturnType<typeof createStaffInvitationSchema>
>;
