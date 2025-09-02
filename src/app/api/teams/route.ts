import { NextResponse } from 'next/server';
import { getAuthenticatedUser, ensureUserExists, getUserTeams } from '../../../lib/clerk-auth';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
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