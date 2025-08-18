import { NextResponse } from 'next/server';
import { getAuthenticatedUser, ensureUserExists, getUserTeam } from '../../../../lib/kinde-auth';

interface RouteContext {
  params: Promise<{ teamId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const kindeUser = await getAuthenticatedUser();
    if (!kindeUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await ensureUserExists(kindeUser);
    const { teamId } = await context.params;
    const team = await getUserTeam(user.id, teamId);

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}