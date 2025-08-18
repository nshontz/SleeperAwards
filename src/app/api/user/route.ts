import { NextResponse } from 'next/server';
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

    const user = await ensureUserExists(kindeUser);
    
    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        teams: user.teams,
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}