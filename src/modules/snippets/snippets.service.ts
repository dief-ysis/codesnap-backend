import prisma from "../../config/database.js";
import {
  NotFoundError,
  ForbiddenError,
} from "../../shared/errors/AppError.js";
import type { CreateSnippetInput, UpdateSnippetInput } from "./snippets.schema.js";
import type { Prisma } from "@prisma/client";

/** Reusable Prisma select object for snippet queries, including user, tags, and fork count. */
const snippetSelect = {
  id: true,
  title: true,
  description: true,
  code: true,
  language: true,
  visibility: true,
  shareSlug: true,
  forkedFromId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
  // Tags are stored via a join table (SnippetTag); we select through it to get tag data
  tags: { select: { tag: { select: { id: true, name: true } } } },
  // Virtual fork count — Prisma doesn't have a `forksCount` field, so we compute it via _count
  _count: { select: { forks: true } },
} satisfies Prisma.SnippetSelect;

/** Flattens the Prisma join-table tags and promotes `_count.forks` to `forksCount`. */
function formatSnippet(snippet: any) {
  return {
    ...snippet,
    // Flatten join-table: [{ tag: { id, name } }] → [{ id, name }]
    tags: snippet.tags.map((st: any) => st.tag),
    // Promote nested _count to a top-level field for cleaner API responses
    forksCount: snippet._count.forks,
    _count: undefined, // Remove the Prisma _count wrapper from the response
  };
}

/** Builds Prisma connectOrCreate operations for tags, normalising names to lowercase. */
async function connectOrCreateTags(tags: string[]) {
  // Each tag uses connectOrCreate on the join table (SnippetTag → Tag)
  // This ensures tags are deduplicated by lowercase name
  return tags.map((name) => ({
    tag: {
      connectOrCreate: {
        where: { name: name.toLowerCase() },
        create: { name: name.toLowerCase() },
      },
    },
  }));
}

/**
 * Creates a new snippet with optional tags.
 *
 * @param userId - Owner's user ID
 * @param input - Validated creation payload
 * @returns The formatted snippet
 */
export async function create(userId: string, input: CreateSnippetInput) {
  const { tags, ...data } = input;

  const snippet = await prisma.snippet.create({
    data: {
      ...data,
      userId,
      tags: tags?.length
        ? { create: await connectOrCreateTags(tags) }
        : undefined,
    },
    select: snippetSelect,
  });

  return formatSnippet(snippet);
}

/**
 * Lists snippets owned by a user with pagination and optional language filter.
 */
export async function listByUser(
  userId: string,
  page: number,
  limit: number,
  language?: string
) {
  const where: Prisma.SnippetWhereInput = { userId };
  if (language) where.language = language;

  const [snippets, total] = await Promise.all([
    prisma.snippet.findMany({
      where,
      select: snippetSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.snippet.count({ where }),
  ]);

  return {
    snippets: snippets.map(formatSnippet),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Retrieves a snippet by ID. Returns 404 (not 403) for private snippets
 * the user doesn't own, to avoid leaking existence.
 *
 * @throws {NotFoundError} If snippet not found or is private and not owned
 */
export async function getById(snippetId: string, requestUserId?: string) {
  const snippet = await prisma.snippet.findUnique({
    where: { id: snippetId },
    select: snippetSelect,
  });

  if (!snippet) throw new NotFoundError("Snippet not found");

  // Intentionally return NotFoundError (not ForbiddenError) to avoid leaking
  // the existence of private snippets to unauthorized users
  if (
    snippet.visibility === "PRIVATE" &&
    snippet.userId !== requestUserId
  ) {
    throw new NotFoundError("Snippet not found");
  }

  return formatSnippet(snippet);
}

/**
 * Updates a snippet. Uses atomic delete-all + recreate strategy for tags.
 *
 * @throws {NotFoundError} If snippet does not exist
 * @throws {ForbiddenError} If the user does not own the snippet
 */
export async function update(
  snippetId: string,
  userId: string,
  input: UpdateSnippetInput
) {
  const existing = await prisma.snippet.findUnique({
    where: { id: snippetId },
    select: { userId: true },
  });

  if (!existing) throw new NotFoundError("Snippet not found");
  if (existing.userId !== userId) throw new ForbiddenError("Not your snippet");

  const { tags, ...data } = input;

  const snippet = await prisma.snippet.update({
    where: { id: snippetId },
    data: {
      ...data,
      // Atomic tag replacement: delete all existing tag associations, then recreate.
      // This avoids complex diffing logic and ensures tags match the input exactly.
      tags: tags
        ? {
            deleteMany: {},
            create: await connectOrCreateTags(tags),
          }
        : undefined,
    },
    select: snippetSelect,
  });

  return formatSnippet(snippet);
}

/**
 * Deletes a snippet. Only the owner can delete.
 *
 * @throws {NotFoundError} If snippet does not exist
 * @throws {ForbiddenError} If the user does not own the snippet
 */
export async function remove(snippetId: string, userId: string) {
  const existing = await prisma.snippet.findUnique({
    where: { id: snippetId },
    select: { userId: true },
  });

  if (!existing) throw new NotFoundError("Snippet not found");
  if (existing.userId !== userId) throw new ForbiddenError("Not your snippet");

  await prisma.snippet.delete({ where: { id: snippetId } });
}

/** Lists public snippets with pagination and optional language filter. */
export async function listPublic(
  page: number,
  limit: number,
  language?: string
) {
  const where: Prisma.SnippetWhereInput = { visibility: "PUBLIC" };
  if (language) where.language = language;

  const [snippets, total] = await Promise.all([
    prisma.snippet.findMany({
      where,
      select: snippetSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.snippet.count({ where }),
  ]);

  return {
    snippets: snippets.map(formatSnippet),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Retrieves a snippet by its public share slug. Returns 404 for private snippets.
 *
 * @throws {NotFoundError} If not found or is private
 */
export async function getByShareSlug(shareSlug: string) {
  const snippet = await prisma.snippet.findUnique({
    where: { shareSlug },
    select: snippetSelect,
  });

  if (!snippet) throw new NotFoundError("Snippet not found");

  if (snippet.visibility === "PRIVATE") {
    throw new NotFoundError("Snippet not found");
  }

  return formatSnippet(snippet);
}

/**
 * Full-text search using PostgreSQL `tsvector`/`tsquery` via raw SQL.
 * Prisma does not natively support full-text search, hence the raw query.
 */
export async function search(
  query: string,
  page: number,
  limit: number,
  language?: string
) {
  const offset = (page - 1) * limit;

  // Raw SQL is required because Prisma doesn't support PostgreSQL tsvector/tsquery natively.
  // We use plainto_tsquery for safe query parsing and ts_rank for relevance ordering.
  // Language filter uses manual SQL escaping (single-quote doubling) since it's
  // concatenated into the query string (parameterized queries don't support dynamic WHERE clauses).
  const languageFilter = language
    ? `AND s.language = '${language.replace(/'/g, "''")}'`
    : "";

  const snippets = await prisma.$queryRawUnsafe<any[]>(
    `SELECT s.id, s.title, s.description, s.code, s.language, s.visibility,
            s.share_slug as "shareSlug", s.forked_from_id as "forkedFromId",
            s.user_id as "userId", s.created_at as "createdAt", s.updated_at as "updatedAt",
            u.username, u.display_name as "displayName", u.avatar_url as "avatarUrl",
            ts_rank(to_tsvector('english', coalesce(s.title,'') || ' ' || coalesce(s.description,'') || ' ' || coalesce(s.code,'')),
                    plainto_tsquery('english', $1)) as rank
     FROM snippets s
     JOIN users u ON s.user_id = u.id
     WHERE s.visibility = 'PUBLIC'
       AND to_tsvector('english', coalesce(s.title,'') || ' ' || coalesce(s.description,'') || ' ' || coalesce(s.code,''))
           @@ plainto_tsquery('english', $1)
       ${languageFilter}
     ORDER BY rank DESC
     LIMIT $2 OFFSET $3`,
    query,
    limit,
    offset
  );

  const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
    `SELECT COUNT(*) as count FROM snippets s
     WHERE s.visibility = 'PUBLIC'
       AND to_tsvector('english', coalesce(s.title,'') || ' ' || coalesce(s.description,'') || ' ' || coalesce(s.code,''))
           @@ plainto_tsquery('english', $1)
       ${languageFilter}`,
    query
  );

  const total = Number(countResult[0].count);

  return {
    snippets: snippets.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      code: s.code,
      language: s.language,
      visibility: s.visibility,
      shareSlug: s.shareSlug,
      forkedFromId: s.forkedFromId,
      userId: s.userId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      user: { id: s.userId, username: s.username, displayName: s.displayName, avatarUrl: s.avatarUrl },
      tags: [], // Raw SQL doesn't join through SnippetTag; tags are omitted for search results
      forksCount: 0, // Fork count not available in raw query; would require an extra subquery
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Forks (copies) a snippet. The fork is always created as PRIVATE and
 * tracks lineage via `forkedFromId`.
 *
 * @throws {NotFoundError} If the original snippet does not exist
 */
export async function fork(snippetId: string, userId: string) {
  const original = await prisma.snippet.findUnique({
    where: { id: snippetId },
    select: {
      title: true,
      description: true,
      code: true,
      language: true,
      visibility: true,
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  if (!original) throw new NotFoundError("Snippet not found");

  const tagNames = original.tags.map((st) => st.tag.name);

  const forked = await prisma.snippet.create({
    data: {
      title: original.title,
      description: original.description,
      code: original.code,
      language: original.language,
      visibility: "PRIVATE", // Forks always start as PRIVATE so the user can review before publishing
      userId,
      forkedFromId: snippetId, // Tracks lineage — enables "forked from" UI and fork counting
      tags: tagNames.length
        ? { create: await connectOrCreateTags(tagNames) }
        : undefined,
    },
    select: snippetSelect,
  });

  return formatSnippet(forked);
}
