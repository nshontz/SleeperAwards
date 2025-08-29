import { PrismaClient } from '../generated/prisma';
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export interface ClerkUser {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
}

export async function getAuthenticatedUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  return { id: userId };
}

export async function ensureUserExists(email: string) {
  if (!email) {
    throw new Error('User email is required');
  }

  // Check if user exists in our database
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      teams: {
        include: {
          league: true,
        },
      },
    },
  });

  // Don't create user automatically - they must be pre-registered
  if (!user) {
    throw new Error('ACCOUNT_NOT_FOUND');
  }

  return user;
}

export async function getUserTeams(userId: string) {
  return await prisma.team.findMany({
    where: { ownerId: userId },
    include: {
      league: true,
    },
  });
}

export async function getUserTeam(userId: string, teamId: string) {
  return await prisma.team.findFirst({
    where: { 
      id: teamId,
      ownerId: userId, // Ensure user owns this team
    },
    include: {
      league: true,
      owner: true,
    },
  });
}