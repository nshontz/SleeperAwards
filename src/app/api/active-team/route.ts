import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthenticatedUser, ensureUserExists } from '../../../lib/kinde-auth';

export async function GET() {
  try {
    const kindeUser = await getAuthenticatedUser();
    if (!kindeUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await ensureUserExists({
      email: kindeUser.email,
      given_name: kindeUser.given_name,
      family_name: kindeUser.family_name,
    });

    const cookieStore = await cookies();
    const activeTeamId = cookieStore.get('activeTeamId')?.value;

    // If no active team is set, default to the first team
    let activeTeam = null;
    if (activeTeamId) {
      // Find the team by ID and verify user owns it
      activeTeam = user.teams.find(team => team.id === activeTeamId);
    }

    // If no active team found or user doesn't own it, default to first team
    if (!activeTeam && user.teams.length > 0) {
      activeTeam = user.teams[0];
    }

    return NextResponse.json({
      activeTeam,
      allTeams: user.teams,
    });
  } catch (error) {
    console.error('Error fetching active team:', error);
    
    if (error instanceof Error && error.message === 'ACCOUNT_NOT_FOUND') {
      return NextResponse.json(
        { error: 'ACCOUNT_NOT_FOUND', message: 'Your account is not registered in this league. Please contact an administrator.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch active team' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const kindeUser = await getAuthenticatedUser();
    if (!kindeUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await ensureUserExists({
      email: kindeUser.email,
      given_name: kindeUser.given_name,
      family_name: kindeUser.family_name,
    });

    const { teamId } = await request.json();

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns this team
    const team = user.teams.find(t => t.id === teamId);
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found or you do not own this team' },
        { status: 404 }
      );
    }

    // Set the active team in cookies (expires in 30 days)
    const cookieStore = await cookies();
    cookieStore.set('activeTeamId', teamId, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return NextResponse.json({
      success: true,
      activeTeam: team,
    });
  } catch (error) {
    console.error('Error setting active team:', error);
    
    if (error instanceof Error && error.message === 'ACCOUNT_NOT_FOUND') {
      return NextResponse.json(
        { error: 'ACCOUNT_NOT_FOUND', message: 'Your account is not registered in this league. Please contact an administrator.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to set active team' },
      { status: 500 }
    );
  }
}