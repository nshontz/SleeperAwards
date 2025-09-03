import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return the default league ID from your seeded database
    const defaultLeagueId = '1262129908398694400'; // Bine to Shrine Fantasy League 2024
    
    return NextResponse.json({ 
      sleeperLeagueId: defaultLeagueId 
    });
  } catch (error) {
    console.error('Error fetching default league:', error);
    return NextResponse.json(
      { error: 'Failed to fetch default league' },
      { status: 500 }
    );
  }
}