import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client instance shared across the application.
 * Prisma v7 reads the datasource URL from `prisma.config.ts`.
 */
const prisma = new PrismaClient();

export default prisma;
