import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../../../../lib/clerk-auth';

interface RouteContext {
  params: Promise<{ leagueId: string }>;
}

interface SleeperRoster {
  owner_id: string;
  roster_id: number;
  league_id: string;
  players: string[] | null;
  starters: string[] | null;
  reserve: string[] | null;
  taxi: string[] | null;
  settings: {
    wins?: number;
    waiver_position?: number;
    waiver_budget_used?: number;
    total_moves?: number;
    ties?: number;
    losses?: number;
    fpts?: number;
    fpts_decimal?: number;
    fpts_against?: number;
    fpts_against_decimal?: number;
  };
  metadata?: {
    streak?: string;
    record?: string;
  };
}

interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar: string | null;
  metadata?: {
    team_name?: string;
  };
}

interface SleeperLeague {
  total_rosters: number;
  status: string;
  sport: string;
  settings: {
    max_keepers?: number;
    draft_rounds?: number;
    trade_deadline?: number;
    reserve_slots?: number;
    taxi_slots?: number;
    squads?: number;
    playoff_teams?: number;
    num_teams?: number;
  };
  season_type: string;
  season: string;
  scoring_settings: Record<string, number>;
  roster_positions: string[];
  previous_league_id: string | null;
  name: string;
  league_id: string;
  draft_id: string | null;
  avatar: string | null;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { leagueId } = await context.params;

    if (!leagueId || typeof leagueId !== 'string') {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }

    // Fetch league info
    const leagueResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`);
    if (!leagueResponse.ok) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }
    const league: SleeperLeague = await leagueResponse.json();

    // Fetch rosters
    const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
    if (!rostersResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch rosters' },
        { status: 500 }
      );
    }
    const rosters: SleeperRoster[] = await rostersResponse.json();

    // Fetch users
    const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
    if (!usersResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }
    const users: SleeperUser[] = await usersResponse.json();

    // Combine roster and user data
    const teams = rosters.map(roster => {
      const user = users.find(u => u.user_id === roster.owner_id);
      return {
        rosterId: roster.roster_id,
        ownerId: roster.owner_id,
        teamName: user?.metadata?.team_name || user?.display_name || user?.username || `Team ${roster.roster_id}`,
        username: user?.username || 'Unknown',
        displayName: user?.display_name,
        avatar: user?.avatar,
        wins: roster.settings.wins || 0,
        losses: roster.settings.losses || 0,
        ties: roster.settings.ties || 0,
        points: ((roster.settings.fpts || 0) + (roster.settings.fpts_decimal || 0) / 100).toFixed(2),
        pointsAgainst: ((roster.settings.fpts_against || 0) + (roster.settings.fpts_against_decimal || 0) / 100).toFixed(2),
      };
    });

    return NextResponse.json({
      league: {
        id: league.league_id,
        name: league.name,
        season: league.season,
        totalTeams: league.total_rosters,
        status: league.status,
      },
      teams: teams.sort((a, b) => b.wins - a.wins || parseFloat(b.points) - parseFloat(a.points))
    });

  } catch (error) {
    console.error('Error fetching Sleeper teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams from Sleeper' },
      { status: 500 }
    );
  }
}