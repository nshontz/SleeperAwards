import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const defaultLeague = await prisma.league.findFirst({
      where: { isDefault: true },
      select: { sleeperLeagueId: true },
    });

    if (!defaultLeague) {
      return NextResponse.json(
        { error: 'Default league not found. Please run the seed script.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ sleeperLeagueId: defaultLeague.sleeperLeagueId });
  } catch (error) {
    console.error('Error fetching default league:', error);
    return NextResponse.json(
      { error: 'Failed to fetch default league' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}