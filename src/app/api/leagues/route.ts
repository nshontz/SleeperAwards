import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';
import { getAuthenticatedUser } from '../../../lib/clerk-auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const leagues = await prisma.league.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        sleeperLeagueId: true,
        _count: {
          select: {
            teams: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ leagues });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}