import { z } from "zod";

/** Zod schema for user registration request body. */
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  displayName: z.string().max(100).optional(),
});

/** Zod schema for login request body. */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/** Inferred type from {@link registerSchema}. */
export type RegisterInput = z.infer<typeof registerSchema>;

/** Inferred type from {@link loginSchema}. */
export type LoginInput = z.infer<typeof loginSchema>;
