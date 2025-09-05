import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, ensureUserExists } from '@/lib/clerk-auth';
import { currentUser } from '@clerk/nextjs/server';
import { awardsService } from '@/lib/awards-service';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// PUT /api/leagues/[leagueId]/awards/[awardTypeId] - Update award customization
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ leagueId: string; awardTypeId: string }> }
) {
  const params = await context.params;
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { leagueId, awardTypeId } = params;
    const { customName, customIcon } = await request.json();

    if (!customName) {
      return NextResponse.json({ error: 'Custom name is required' }, { status: 400 });
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

    // Update the customization
    const customization = await awardsService.customizeAwardForLeague(
      leagueId,
      awardTypeId,
      customName,
      customIcon
    );

    return NextResponse.json({ customization });
  } catch (error) {
    console.error('Error updating award customization:', error);
    return NextResponse.json({ error: 'Failed to update award customization' }, { status: 500 });
  }
}

// DELETE /api/leagues/[leagueId]/awards/[awardTypeId] - Disable award for league
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ leagueId: string; awardTypeId: string }> }
) {
  const params = await context.params;
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { leagueId, awardTypeId } = params;

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

    // Disable the award for this league
    await awardsService.disableAwardForLeague(leagueId, awardTypeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disabling award:', error);
    return NextResponse.json({ error: 'Failed to disable award' }, { status: 500 });
  }
}