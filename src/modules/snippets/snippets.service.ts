import prisma from "../../config/database.js";
import {
  NotFoundError,
  ForbiddenError,
} from "../../shared/errors/AppError.js";
import type { CreateSnippetInput, UpdateSnippetInput } from "./snippets.schema.js";
import type { Prisma } from "@prisma/client";

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
  tags: { select: { tag: { select: { id: true, name: true } } } },
  _count: { select: { forks: true } },
} satisfies Prisma.SnippetSelect;

function formatSnippet(snippet: any) {
  return {
    ...snippet,
    tags: snippet.tags.map((st: any) => st.tag),
    forksCount: snippet._count.forks,
    _count: undefined,
  };
}

async function connectOrCreateTags(tags: string[]) {
  return tags.map((name) => ({
    tag: {
      connectOrCreate: {
        where: { name: name.toLowerCase() },
        create: { name: name.toLowerCase() },
      },
    },
  }));
}

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

export async function getById(snippetId: string, requestUserId?: string) {
  const snippet = await prisma.snippet.findUnique({
    where: { id: snippetId },
    select: snippetSelect,
  });

  if (!snippet) throw new NotFoundError("Snippet not found");

  if (
    snippet.visibility === "PRIVATE" &&
    snippet.userId !== requestUserId
  ) {
    throw new NotFoundError("Snippet not found");
  }

  return formatSnippet(snippet);
}

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

export async function remove(snippetId: string, userId: string) {
  const existing = await prisma.snippet.findUnique({
    where: { id: snippetId },
    select: { userId: true },
  });

  if (!existing) throw new NotFoundError("Snippet not found");
  if (existing.userId !== userId) throw new ForbiddenError("Not your snippet");

  await prisma.snippet.delete({ where: { id: snippetId } });
}

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

export async function search(
  query: string,
  page: number,
  limit: number,
  language?: string
) {
  const offset = (page - 1) * limit;

  // Full-text search using PostgreSQL tsvector
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
      tags: [],
      forksCount: 0,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

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
      visibility: "PRIVATE",
      userId,
      forkedFromId: snippetId,
      tags: tagNames.length
        ? { create: await connectOrCreateTags(tagNames) }
        : undefined,
    },
    select: snippetSelect,
  });

  return formatSnippet(forked);
}
