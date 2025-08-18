import { NextResponse } from 'next/server';
import { getAuthenticatedUser, ensureUserExists, getUserTeams } from '../../../lib/kinde-auth';

export async function GET() {
  try {
    const kindeUser = await getAuthenticatedUser();
    if (!kindeUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await ensureUserExists(kindeUser);
    const teams = await getUserTeams(user.id);
    
    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}