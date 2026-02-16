import prisma from "../../config/database.js";
import { NotFoundError } from "../../shared/errors/AppError.js";

/**
 * Retrieves a user's public profile including snippet count.
 *
 * @param userId - ID of the user to look up
 * @returns Public profile data
 * @throws {NotFoundError} If the user does not exist
 */
export async function getPublicProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: { select: { snippets: true } },
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

/**
 * Updates the authenticated user's profile fields.
 *
 * @param userId - ID of the user to update
 * @param data - Fields to update (displayName, bio, avatarUrl)
 * @returns The updated user profile
 */
export async function updateProfile(
  userId: string,
  data: { displayName?: string; bio?: string; avatarUrl?: string }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
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
