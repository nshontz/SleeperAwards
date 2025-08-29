'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  id: string;
  email: string;
  name: string | null;
  teams: Array<{
    id: string;
    name: string;
    sleeperRosterId: string | null;
    leagueId: string;
  }>;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const hasTeams = user?.teams && user.teams.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
        <div className="container max-w-4xl mx-auto py-16">
          <Card className="backdrop-blur-md bg-card/95 shadow-2xl">
            <CardHeader className="text-center">
              <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!hasTeams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
        <div className="container max-w-4xl mx-auto py-16">
          <Card className="backdrop-blur-md bg-card/95 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-5xl font-bold mb-4">
                🍺 Welcome to BineTime 🍺
              </CardTitle>
              <CardDescription className="text-xl">
                Your hop-themed fantasy football hub
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Card className="bg-muted/50 mb-8">
                <CardContent className="p-8">
                  <p className="text-lg mb-6">
                    Get started by joining a league with your Sleeper league ID
                  </p>
                  <Button asChild size="lg" className="bg-hop-gold hover:bg-hop-gold/90 text-hop-brown font-semibold">
                    <Link href="/join-league">
                      Join Your First League →
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Header */}
      <div className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            🍺 Bine to Shrine Fantasy League 🍺
          </h1>
          <p className="text-2xl text-primary font-semibold mb-6">
            Your hop-themed fantasy football hub
          </p>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            From the bine to the shrine - track awards, standings, and more
          </p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="container max-w-4xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Awards Card */}
          <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-xl backdrop-blur-md bg-card/95 border-2 hover:border-primary/50">
            <Link href="/awards" className="block h-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                  🏆 Fantasy Awards
                </CardTitle>
                <CardDescription className="text-lg">
                  Hop-themed awards tracking the best and worst performances of the season
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="bg-hop-gold hover:bg-hop-gold/90 text-hop-brown font-semibold">
                  View Awards →
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Team Standings Card */}
          <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-xl backdrop-blur-md bg-card/95 border-2 hover:border-primary/50">
            <Link href="/teams" className="block h-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                  📊 Team Standings
                </CardTitle>
                <CardDescription className="text-lg">
                  Teams broken down by division with rankings, records, and top awards
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="bg-hop-gold hover:bg-hop-gold/90 text-hop-brown font-semibold">
                  View Standings →
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}