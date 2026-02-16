import prisma from "../../config/database.js";

export async function listWithCount() {
  const tags = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { snippets: true } },
    },
    orderBy: { name: "asc" },
  });

  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    snippetCount: t._count.snippets,
  }));
}

export async function getSnippetsByTag(
  tagName: string,
  page: number,
  limit: number
) {
  const [snippets, total] = await Promise.all([
    prisma.snippet.findMany({
      where: {
        visibility: "PUBLIC",
        tags: { some: { tag: { name: tagName.toLowerCase() } } },
      },
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
        _count: { select: { forks: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.snippet.count({
      where: {
        visibility: "PUBLIC",
        tags: { some: { tag: { name: tagName.toLowerCase() } } },
      },
    }),
  ]);

  return {
    snippets: snippets.map((s) => ({
      ...s,
      tags: s.tags.map((st) => st.tag),
      forksCount: s._count.forks,
      _count: undefined,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
