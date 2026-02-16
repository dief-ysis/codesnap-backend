import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
