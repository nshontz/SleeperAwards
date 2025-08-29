import { NextResponse } from 'next/server';
import { getAuthenticatedUser, ensureUserExists, getUserTeam } from '@/lib/clerk-auth';
import { currentUser } from '@clerk/nextjs/server';

interface RouteContext {
  params: Promise<{ teamId: string }>;
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

    const clerkUser = await currentUser();
    if (!clerkUser || !clerkUser.primaryEmailAddress) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    const user = await ensureUserExists(clerkUser.primaryEmailAddress.emailAddress);
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