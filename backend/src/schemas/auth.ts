import { z } from "zod";

export const AuthSchema = z.object({
  user: z.string({
    required_error: "User is required",
    invalid_type_error: "User must be a string",
  }),
  pass: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

export type Auth = z.infer<typeof AuthSchema>;
