import { NextResponse } from 'next/server';
import { getAuthenticatedUser, ensureUserExists } from '../../../lib/clerk-auth';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
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