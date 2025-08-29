import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { getAuthenticatedUser, ensureUserExists } from '../../../../lib/clerk-auth';
import { currentUser } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();
    if (!clerkUser || !clerkUser.primaryEmailAddress) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { sleeperLeagueId, sleeperRosterId, teamName, leagueName } = body;

    if (!sleeperLeagueId || !sleeperRosterId || !teamName) {
      return NextResponse.json(
        { error: 'Missing required fields: sleeperLeagueId, sleeperRosterId, teamName' },
        { status: 400 }
      );
    }

    // Verify the league exists on Sleeper
    const leagueResponse = await fetch(`https://api.sleeper.app/v1/league/${sleeperLeagueId}`);
    if (!leagueResponse.ok) {
      return NextResponse.json(
        { error: 'League not found on Sleeper' },
        { status: 404 }
      );
    }
    const sleeperLeague = await leagueResponse.json();

    // Verify the roster exists
    const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${sleeperLeagueId}/rosters`);
    if (!rostersResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify roster' },
        { status: 500 }
      );
    }
    const rosters = await rostersResponse.json();
    const roster = rosters.find((r: { roster_id: number }) => r.roster_id === parseInt(sleeperRosterId));
    if (!roster) {
      return NextResponse.json(
        { error: 'Roster not found in league' },
        { status: 404 }
      );
    }

    // Get or create user in our database
    let user;
    try {
      user = await ensureUserExists(clerkUser.primaryEmailAddress.emailAddress);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'ACCOUNT_NOT_FOUND') {
        // Create the user since they don't exist yet
        user = await prisma.user.create({
          data: {
            email: clerkUser.primaryEmailAddress.emailAddress,
            name: clerkUser.firstName && clerkUser.lastName 
              ? `${clerkUser.firstName} ${clerkUser.lastName}`
              : clerkUser.firstName || clerkUser.lastName || null,
          },
        });
      } else {
        throw error;
      }
    }

    // Check if league exists in our database, create if not
    let league = await prisma.league.findUnique({
      where: { sleeperLeagueId },
    });

    if (!league) {
      league = await prisma.league.create({
        data: {
          name: leagueName || sleeperLeague.name || `League ${sleeperLeagueId}`,
          description: `Fantasy league for ${sleeperLeague.season} season`,
          sleeperLeagueId,
        },
      });
    }

    // Check if user already has a team in this league
    const existingTeam = await prisma.team.findUnique({
      where: {
        ownerId_leagueId: {
          ownerId: user.id,
          leagueId: league.id,
        },
      },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: 'You already have a team in this league' },
        { status: 409 }
      );
    }

    // Check if this roster is already claimed within this league
    const existingRoster = await prisma.team.findUnique({
      where: {
        sleeperRosterId_leagueId: {
          sleeperRosterId: sleeperRosterId.toString(),
          leagueId: league.id,
        },
      },
    });

    if (existingRoster) {
      return NextResponse.json(
        { error: 'This team is already claimed by another user' },
        { status: 409 }
      );
    }

    // Create the team
    const team = await prisma.team.create({
      data: {
        name: teamName,
        sleeperRosterId: sleeperRosterId.toString(),
        ownerId: user.id,
        leagueId: league.id,
      },
      include: {
        league: true,
        owner: true,
      },
    });

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        sleeperRosterId: team.sleeperRosterId,
        league: {
          id: team.league.id,
          name: team.league.name,
          sleeperLeagueId: team.league.sleeperLeagueId,
        },
      },
    });

  } catch (error) {
    console.error('Error joining league:', error);
    return NextResponse.json(
      { error: 'Failed to join league' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}