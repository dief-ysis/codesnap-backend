import prisma from "../../config/database.js";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "../../shared/errors/AppError.js";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "./collections.schema.js";

/** Creates a new collection owned by the given user. */
export async function create(userId: string, input: CreateCollectionInput) {
  return prisma.collection.create({
    data: { ...input, userId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: { select: { snippets: true } },
    },
  });
}

/** Lists all collections owned by a user, with snippet counts. */
export async function listByUser(userId: string) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: { select: { snippets: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return collections.map((c) => ({
    ...c,
    snippetCount: c._count.snippets,
    _count: undefined,
  }));
}

/**
 * Retrieves a collection with its snippets, flattening the join-table structure.
 *
 * @throws {NotFoundError} If collection does not exist
 * @throws {ForbiddenError} If user does not own the collection
 */
export async function getById(collectionId: string, userId: string) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: {
      id: true,
      name: true,
      description: true,
      userId: true,
      createdAt: true,
      snippets: {
        select: {
          addedAt: true,
          snippet: {
            select: {
              id: true,
              title: true,
              description: true,
              language: true,
              visibility: true,
              shareSlug: true,
              createdAt: true,
              user: { select: { id: true, username: true, displayName: true } },
              tags: { select: { tag: { select: { id: true, name: true } } } },
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!collection) throw new NotFoundError("Collection not found");
  if (collection.userId !== userId)
    throw new ForbiddenError("Not your collection");

  // Flatten the join-table structure: CollectionSnippet → Snippet with addedAt promoted,
  // and SnippetTag → Tag flattened, so the API response is clean and easy to consume.
  return {
    ...collection,
    snippets: collection.snippets.map((cs) => ({
      ...cs.snippet,
      addedAt: cs.addedAt,
      tags: cs.snippet.tags.map((st) => st.tag),
    })),
  };
}

/** Updates a collection's name and/or description. Owner-only. */
export async function update(
  collectionId: string,
  userId: string,
  input: UpdateCollectionInput
) {
  const existing = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  });

  if (!existing) throw new NotFoundError("Collection not found");
  if (existing.userId !== userId)
    throw new ForbiddenError("Not your collection");

  return prisma.collection.update({
    where: { id: collectionId },
    data: input,
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      _count: { select: { snippets: true } },
    },
  });
}

/** Deletes a collection. Owner-only. */
export async function remove(collectionId: string, userId: string) {
  const existing = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  });

  if (!existing) throw new NotFoundError("Collection not found");
  if (existing.userId !== userId)
    throw new ForbiddenError("Not your collection");

  await prisma.collection.delete({ where: { id: collectionId } });
}

/**
 * Adds a snippet to a collection. Checks the composite unique key first.
 *
 * @throws {ConflictError} If the snippet is already in the collection
 */
export async function addSnippet(
  collectionId: string,
  snippetId: string,
  userId: string
) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  });

  if (!collection) throw new NotFoundError("Collection not found");
  if (collection.userId !== userId)
    throw new ForbiddenError("Not your collection");

  // Pre-check the composite unique key (collectionId + snippetId) before inserting.
  // This gives a clear ConflictError instead of an opaque Prisma unique constraint violation.
  const existing = await prisma.collectionSnippet.findUnique({
    where: { collectionId_snippetId: { collectionId, snippetId } },
  });

  if (existing) throw new ConflictError("Snippet already in collection");

  await prisma.collectionSnippet.create({
    data: { collectionId, snippetId },
  });
}

/** Removes a snippet from a collection. Owner-only. */
export async function removeSnippet(
  collectionId: string,
  snippetId: string,
  userId: string
) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  });

  if (!collection) throw new NotFoundError("Collection not found");
  if (collection.userId !== userId)
    throw new ForbiddenError("Not your collection");

  await prisma.collectionSnippet.delete({
    where: { collectionId_snippetId: { collectionId, snippetId } },
  });
}
