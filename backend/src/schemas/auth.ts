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

export type Auth = z.infer<typeof AuthSchema>;
