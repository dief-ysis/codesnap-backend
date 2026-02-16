import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

/** Zod schema that validates and coerces all required environment variables. */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

/** Parsed and validated environment configuration. Throws on startup if env vars are invalid. */
export const config = envSchema.parse(process.env);

/** TypeScript type inferred from the environment schema. */
export type Config = z.infer<typeof envSchema>;
