import prisma from "../../config/database.js";
import { hashPassword, comparePassword } from "../../shared/utils/hash.js";
import { signToken } from "../../shared/utils/jwt.js";
import {
  ConflictError,
  UnauthorizedError,
} from "../../shared/errors/AppError.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";

export async function register(input: RegisterInput) {
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
