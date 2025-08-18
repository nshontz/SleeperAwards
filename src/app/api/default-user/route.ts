import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const defaultUser = await prisma.user.findFirst({
      where: { isDefault: true },
      include: {
        teams: {
          include: {
            league: true,
          },
        },
      },
    });

    const defaultLeague = await prisma.league.findFirst({
      where: { isDefault: true },
    });

    if (!defaultUser || !defaultLeague) {
      return NextResponse.json(
        { error: 'Default user or league not found. Please run the seed script.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: defaultUser,
      league: defaultLeague,
      sleeperLeagueId: defaultLeague.sleeperLeagueId,
    });
  } catch (error) {
    console.error('Error fetching default user and league:', error);
    return NextResponse.json(
      { error: 'Failed to fetch default user and league' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}