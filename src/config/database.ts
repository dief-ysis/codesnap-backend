import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client instance shared across the application.
 * Reads the datasource URL from the `DATABASE_URL` environment variable.
 */
const prisma = new PrismaClient();

export default prisma;
