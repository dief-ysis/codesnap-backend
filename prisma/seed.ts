import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create users
  const passwordHash = await bcrypt.hash("password123", 12);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      username: "alice",
      passwordHash,
      displayName: "Alice Dev",
      bio: "Full-stack developer who loves TypeScript and React.",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      username: "bob",
      passwordHash,
      displayName: "Bob Coder",
      bio: "Backend engineer. Python and Go enthusiast.",
    },
  });

  // Create tags
  const tagNames = ["react", "typescript", "hooks", "python", "api", "css", "node", "sql", "go", "rust"];
  const tags: Record<string, { id: string }> = {};

  for (const name of tagNames) {
    tags[name] = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Create snippets
  const snippet1 = await prisma.snippet.create({
    data: {
      title: "useLocalStorage Hook",
      description: "Custom React hook for persistent state with localStorage",
      code: `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
      language: "typescript",
      visibility: "PUBLIC",
      userId: alice.id,
      tags: {
        create: [
          { tag: { connect: { id: tags["react"].id } } },
          { tag: { connect: { id: tags["typescript"].id } } },
          { tag: { connect: { id: tags["hooks"].id } } },
        ],
      },
    },
  });

  const snippet2 = await prisma.snippet.create({
    data: {
      title: "Express Error Handler",
      description: "Centralized error handling middleware for Express.js",
      code: `import type { Request, Response, NextFunction } from "express";

class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
  }
}

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  console.error("Unexpected error:", err);
  res.status(500).json({ status: "error", message: "Internal server error" });
}

export { AppError, errorHandler };`,
      language: "typescript",
      visibility: "PUBLIC",
      userId: alice.id,
      tags: {
        create: [
          { tag: { connect: { id: tags["node"].id } } },
          { tag: { connect: { id: tags["typescript"].id } } },
          { tag: { connect: { id: tags["api"].id } } },
        ],
      },
    },
  });

  const snippet3 = await prisma.snippet.create({
    data: {
      title: "Python Fibonacci Generator",
      description: "Efficient fibonacci sequence generator using memoization",
      code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n: int) -> int:
    """Calculate the nth Fibonacci number with memoization."""
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

def fibonacci_sequence(count: int) -> list[int]:
    """Generate a list of Fibonacci numbers."""
    return [fibonacci(i) for i in range(count)]

if __name__ == "__main__":
    print(fibonacci_sequence(20))`,
      language: "python",
      visibility: "PUBLIC",
      userId: bob.id,
      tags: {
        create: [
          { tag: { connect: { id: tags["python"].id } } },
        ],
      },
    },
  });

  const snippet4 = await prisma.snippet.create({
    data: {
      title: "CSS Glass Morphism Card",
      description: "Modern glassmorphism card with backdrop blur",
      code: `.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}`,
      language: "css",
      visibility: "PUBLIC",
      userId: bob.id,
      tags: {
        create: [
          { tag: { connect: { id: tags["css"].id } } },
        ],
      },
    },
  });

  // Create a fork
  await prisma.snippet.create({
    data: {
      title: "useLocalStorage Hook (improved)",
      description: "Forked version with error handling",
      code: snippet1.code.replace(
        "return stored ? JSON.parse(stored) : initialValue;",
        `try {\n      return stored ? JSON.parse(stored) : initialValue;\n    } catch {\n      return initialValue;\n    }`
      ),
      language: "typescript",
      visibility: "PRIVATE",
      userId: bob.id,
      forkedFromId: snippet1.id,
      tags: {
        create: [
          { tag: { connect: { id: tags["react"].id } } },
          { tag: { connect: { id: tags["typescript"].id } } },
        ],
      },
    },
  });

  // Create collections
  const collection = await prisma.collection.create({
    data: {
      name: "Frontend Utils",
      description: "Useful frontend utility snippets",
      userId: alice.id,
      snippets: {
        create: [
          { snippetId: snippet1.id },
          { snippetId: snippet4.id },
        ],
      },
    },
  });

  await prisma.collection.create({
    data: {
      name: "Backend Patterns",
      description: "Common backend patterns and utilities",
      userId: bob.id,
      snippets: {
        create: [
          { snippetId: snippet2.id },
          { snippetId: snippet3.id },
        ],
      },
    },
  });

  console.log("Seed complete!");
  console.log(`  Users: ${alice.username}, ${bob.username}`);
  console.log(`  Snippets: 5 (4 public + 1 private fork)`);
  console.log(`  Tags: ${tagNames.length}`);
  console.log(`  Collections: 2`);
  console.log(`\n  Login: alice@example.com / password123`);
  console.log(`  Login: bob@example.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
