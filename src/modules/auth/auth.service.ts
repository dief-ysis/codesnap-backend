import prisma from "../../config/database.js";
import { hashPassword, comparePassword } from "../../shared/utils/hash.js";
import { signToken } from "../../shared/utils/jwt.js";
import {
  ConflictError,
  UnauthorizedError,
} from "../../shared/errors/AppError.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";

/**
 * Registers a new user after checking for duplicate email/username.
 *
 * @param input - Validated registration payload
 * @returns Created user (without passwordHash) and a signed JWT
 * @throws {ConflictError} If the email or username is already taken
 */
export async function register(input: RegisterInput) {
  // Single-query duplicate check: uses OR to find any user matching either email
  // or username, avoiding two separate queries. We then compare the matched field
  // to provide a field-specific error message ("Email" vs "Username" already taken).
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }],
    },
  });

  if (existing) {
    const field = existing.email === input.email ? "Email" : "Username";
    throw new ConflictError(`${field} already taken`);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      passwordHash,
      displayName: input.displayName,
    },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      createdAt: true,
    },
  });

  const token = signToken({ userId: user.id });

  return { user, token };
}

/**
 * Authenticates a user by email and password.
 *
 * @param input - Validated login payload
 * @returns User profile and a signed JWT
 * @throws {UnauthorizedError} If credentials are invalid
 */
export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = signToken({ userId: user.id });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
    },
    token,
  };
}

/**
 * Retrieves the current user's profile.
 *
 * @param userId - ID of the authenticated user
 * @returns User profile or `null` if not found
 */
export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
    },
  });

  return user;
}
