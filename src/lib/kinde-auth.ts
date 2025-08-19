import { PrismaClient } from '../generated/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const prisma = new PrismaClient();

export interface KindeUser {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export async function getAuthenticatedUser() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  
  if (!await isAuthenticated()) {
    return null;
  }

  const kindeUser = await getUser();
  if (!kindeUser) {
    return null;
  }

  return kindeUser;
}

export async function ensureUserExists(kindeUser: {
  email: string | null;
  given_name?: string | null;
  family_name?: string | null;
}) {
  const email = kindeUser.email;
  if (!email) {
    throw new Error('User email is required');
  }

  // Check if user exists in our database
  let user = await prisma.user.findUnique({
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