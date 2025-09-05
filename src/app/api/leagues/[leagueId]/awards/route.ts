import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, ensureUserExists } from '@/lib/clerk-auth';
import { currentUser } from '@clerk/nextjs/server';
import { awardsService } from '@/lib/awards-service';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/leagues/[leagueId]/awards - Get all award configurations for a league
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ leagueId: string }> }
) {
  const params = await context.params;
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { leagueId } = params;

    // Get the database user (same pattern as /api/user route)
    const clerkUser = await currentUser();
    if (!clerkUser || !clerkUser.primaryEmailAddress) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const dbUser = await ensureUserExists(clerkUser.primaryEmailAddress.emailAddress);

    // Verify user has access to this league
    const userTeam = await prisma.team.findFirst({
      where: {
        ownerId: dbUser.id,
        leagueId: leagueId
      }
    });

    if (!userTeam) {
      return NextResponse.json({ error: 'Access denied to this league' }, { status: 403 });
    }

    // Get award configurations for the league
    const awardConfigs = await awardsService.getAwardConfigsForLeague(leagueId);
    const customizations = await awardsService.getLeagueCustomizations(leagueId);

    return NextResponse.json({
      awardConfigs,
      customizations
    });
  } catch (error) {
    console.error('Error fetching league awards:', error);
    return NextResponse.json({ error: 'Failed to fetch league awards' }, { status: 500 });
  }
}

// POST /api/leagues/[leagueId]/awards - Customize an award for a league
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ leagueId: string }> }
) {
  const params = await context.params;
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { leagueId } = params;
    const { awardTypeId, customName, customIcon } = await request.json();

    if (!awardTypeId || !customName) {
      return NextResponse.json(
        { error: 'Award type ID and custom name are required' },
        { status: 400 }
      );
    }

    // Get the database user (same pattern as /api/user route)
    const clerkUser = await currentUser();
    if (!clerkUser || !clerkUser.primaryEmailAddress) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const dbUser = await ensureUserExists(clerkUser.primaryEmailAddress.emailAddress);

    // Verify user has access to this league
    const userTeam = await prisma.team.findFirst({
      where: {
        ownerId: dbUser.id,
        leagueId: leagueId
      }
    });

    if (!userTeam) {
      return NextResponse.json({ error: 'Access denied to this league' }, { status: 403 });
    }

    // Create or update the customization
    const customization = await awardsService.customizeAwardForLeague(
      leagueId,
      awardTypeId,
      customName,
      customIcon
    );

    return NextResponse.json({ customization });
  } catch (error) {
    console.error('Error customizing award:', error);
    return NextResponse.json({ error: 'Failed to customize award' }, { status: 500 });
  }
}