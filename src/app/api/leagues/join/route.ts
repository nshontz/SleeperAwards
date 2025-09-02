import { NextResponse } from 'next/server';
import { getAuthenticatedUser, ensureUserExists } from '../../../../lib/clerk-auth';
import { currentUser } from '@clerk/nextjs/server';
import { 
  ApiError, 
  handleApiError, 
  createSuccessResponse, 
  SleeperApi, 
  validateRequired, 
  withPrismaCleanup,
  prisma 
} from '../../../../lib/api-utils';
import { LeagueJoinRequest } from '../../../../types/common';
import { HTTP_STATUS } from '../../../../constants/api';

export async function POST(request: Request): Promise<NextResponse> {
  return withPrismaCleanup(async () => {
    // Auth check
    const authResult = await getAuthenticatedUser();
    if (!authResult) {
      throw new ApiError('Authentication required', HTTP_STATUS.UNAUTHORIZED);
    }

    const clerkUser = await currentUser();
    if (!clerkUser?.primaryEmailAddress) {
      throw new ApiError('User email not found', HTTP_STATUS.BAD_REQUEST);
    }

    // Validate request body
    const body = await request.json() as LeagueJoinRequest;
    validateRequired(body as unknown as Record<string, unknown>, ['sleeperLeagueId', 'sleeperRosterId', 'teamName']);

    const { sleeperLeagueId, sleeperRosterId, teamName, leagueName } = body;

    // Verify league and roster exist on Sleeper
    const [sleeperLeague, rosters] = await Promise.all([
      SleeperApi.fetchLeague(sleeperLeagueId),
      SleeperApi.fetchRosters(sleeperLeagueId)
    ]);

    const roster = rosters.find((r: { roster_id: number }) => r.roster_id === sleeperRosterId);
    if (!roster) {
      throw new ApiError('Roster not found in league', HTTP_STATUS.NOT_FOUND);
    }

    // Get or create user in our database
    let user;
    try {
      user = await ensureUserExists(clerkUser.primaryEmailAddress.emailAddress);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'ACCOUNT_NOT_FOUND') {
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

    // Get or create league in our database
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

    // Check for existing team or roster conflicts
    const [existingTeam, existingRoster] = await Promise.all([
      prisma.team.findUnique({
        where: {
          ownerId_leagueId: {
            ownerId: user.id,
            leagueId: league.id,
          },
        },
      }),
      prisma.team.findUnique({
        where: {
          sleeperRosterId_leagueId: {
            sleeperRosterId: sleeperRosterId.toString(),
            leagueId: league.id,
          },
        },
      })
    ]);

    if (existingTeam) {
      throw new ApiError('You already have a team in this league', HTTP_STATUS.CONFLICT);
    }

    if (existingRoster) {
      throw new ApiError('This team is already claimed by another user', HTTP_STATUS.CONFLICT);
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

    return createSuccessResponse({
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

  }).catch(handleApiError);
}