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

    const user = await ensureUserExists({
      email: kindeUser.email,
      given_name: kindeUser.given_name,
      family_name: kindeUser.family_name,
    });
    
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
    
    if (error instanceof Error && error.message === 'ACCOUNT_NOT_FOUND') {
      return NextResponse.json(
        { error: 'ACCOUNT_NOT_FOUND', message: 'Your account is not registered in this league. Please contact an administrator.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}