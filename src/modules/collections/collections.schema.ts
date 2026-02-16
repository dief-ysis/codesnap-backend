import { z } from "zod";

/** Zod schema for creating a new collection. */
export const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

/** Zod schema for updating a collection (all fields optional). */
export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const collectionIdParamSchema = z.object({
  id: z.string().min(1),
});

export const collectionSnippetParamSchema = z.object({
  id: z.string().min(1),
  snippetId: z.string().min(1),
});

/** Zod schema for adding a snippet to a collection. */
export const addSnippetSchema = z.object({
  snippetId: z.string().min(1, "Snippet ID is required"),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
