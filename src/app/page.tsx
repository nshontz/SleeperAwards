'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/useUser';
import { APP_SUBTITLE, APP_DESCRIPTION, MENU_ITEMS } from '@/constants/navigation';

export default function Home() {
  const { user, loading } = useUser();

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
            {APP_SUBTITLE}
          </p>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            {APP_DESCRIPTION}
          </p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="container max-w-4xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Awards Card */}
          <Card className="group hover:scale-105 transition-all duration-300 hover:shadow-xl backdrop-blur-md bg-card/95 border-2 hover:border-primary/50">
            <Link href={MENU_ITEMS.AWARDS.href} className="block h-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                  {MENU_ITEMS.AWARDS.icon} Fantasy {MENU_ITEMS.AWARDS.label}
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
            <Link href={MENU_ITEMS.TEAMS.href} className="block h-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                  {MENU_ITEMS.TEAMS.icon} {MENU_ITEMS.TEAMS.label}
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