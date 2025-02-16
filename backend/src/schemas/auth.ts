import { z } from "zod";

export const AuthSchema = z.object({
  user: z
    .string({
      required_error: "User is required",
      invalid_type_error: "User must be a string",
    })
    .min(3, { message: "Username must be at least 3 characters long" }),
  pass: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(3, { message: "Password must be at least 8 characters long" }),
});

export const CompleteAuthWithIdSchema = z.object({
  userId: z
    .string({
      required_error: "UserId is required",
      invalid_type_error: "UserId must be a string",
    })
    .min(3, { message: "UserId must be at least 3 characters long" }),
  user: z
    .string({
      required_error: "User is required",
      invalid_type_error: "User must be a string",
    })
    .min(3, { message: "Username must be at least 3 characters long" }),
  pass: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(3, { message: "Password must be at least 8 characters long" }),
});

export type Auth = z.infer<typeof AuthSchema>;
export type CompleteAuthWithId = z.infer<typeof CompleteAuthWithIdSchema>;
