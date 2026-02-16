import { z } from "zod";

/** Zod schema for updating a user profile (all fields optional). */
export const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

/** Zod schema for validating the `:id` route parameter. */
export const userIdParamSchema = z.object({
  id: z.string().min(1),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
