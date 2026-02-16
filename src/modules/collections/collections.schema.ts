import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
});

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

export const addSnippetSchema = z.object({
  snippetId: z.string().min(1, "Snippet ID is required"),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
