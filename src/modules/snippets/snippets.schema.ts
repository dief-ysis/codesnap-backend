import { z } from "zod";

export const createSnippetSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  code: z.string().min(1, "Code is required").max(100_000),
  language: z.string().min(1, "Language is required").max(50),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).default("PRIVATE"),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const updateSnippetSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  code: z.string().min(1).max(100_000).optional(),
  language: z.string().min(1).max(50).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED"]).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const snippetIdParamSchema = z.object({
  id: z.string().min(1),
});

export const shareSlugParamSchema = z.object({
  shareSlug: z.string().min(1),
});

export const listSnippetsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  language: z.string().optional(),
});

export const searchSnippetsQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  language: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;
