'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContainer, ResponsiveContainer } from '@/components/ui/responsive-container';
import { useUser } from '@/hooks/useUser';
import { APP_SUBTITLE, APP_DESCRIPTION, MENU_ITEMS } from '@/constants/navigation';

export default function Home() {
  const { user, loading } = useUser();

  const hasTeams = user?.teams && user.teams.length > 0;

  if (loading) {
    return (
      <PageContainer>
        <ResponsiveContainer maxWidth="4xl" className="py-8 sm:py-16">
          <Card className="backdrop-blur-md bg-card/95 shadow-xl sm:shadow-2xl">
            <CardHeader className="text-center p-4 sm:p-6">
              <Skeleton className="h-8 sm:h-12 w-3/4 mx-auto mb-2 sm:mb-4" />
              <Skeleton className="h-4 sm:h-6 w-1/2 mx-auto" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:gap-8">
                <Skeleton className="h-32 sm:h-40 lg:h-48 w-full" />
                <Skeleton className="h-32 sm:h-40 lg:h-48 w-full" />
              </div>
            </CardContent>
          </Card>
        </ResponsiveContainer>
      </PageContainer>
    );
  }

  // If user is not authenticated, show login screen
  if (!user && !loading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <ResponsiveContainer maxWidth="sm">
          <Card className="w-full backdrop-blur-md bg-card/95 shadow-xl sm:shadow-2xl">
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">🍺 Welcome to BineTime</CardTitle>
              <CardDescription className="text-sm sm:text-base lg:text-lg">
                Sign in to access your fantasy football teams and track your performance.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <Button asChild className="w-full bg-hop-gold hover:bg-hop-gold/90 text-hop-brown font-semibold text-sm sm:text-base">
                <Link href="/login">
                  Sign In to Get Started
                </Link>
              </Button>

              <div className="text-center">
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Secure authentication powered by Clerk
                </p>
              </div>
            </CardContent>
          </Card>
        </ResponsiveContainer>
      </PageContainer>
    );
  }

  if (!hasTeams) {
    return (
      <PageContainer>
        <ResponsiveContainer maxWidth="4xl" className="py-8 sm:py-16">
          <Card className="backdrop-blur-md bg-card/95 shadow-xl sm:shadow-2xl">
            <CardHeader className="text-center p-4 sm:p-6 lg:p-8">
              <CardTitle className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-4">
                🍺 Welcome to BineTime 🍺
              </CardTitle>
              <CardDescription className="text-base sm:text-lg lg:text-xl">
                Your hop-themed fantasy football hub
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center p-4 sm:p-6 lg:p-8">
              <Card className="bg-muted/50 mb-4 sm:mb-6 lg:mb-8">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">
                    Get started by joining a league with your Sleeper league ID
                  </p>
                  <Button 
                    asChild 
                    size="default" 
                    className="w-full sm:w-auto bg-hop-gold hover:bg-hop-gold/90 text-hop-brown font-semibold text-sm sm:text-base"
                  >
                    <Link href="/join-league">
                      Join Your First League →
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </ResponsiveContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <ResponsiveContainer maxWidth="4xl" className="py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-4">
            🍺 Bine to Shrine Fantasy League 🍺
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-primary font-semibold mb-3 sm:mb-6">
            {APP_SUBTITLE}
          </p>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            {APP_DESCRIPTION}
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-4 sm:gap-6 lg:gap-8 md:grid-cols-2">
          {/* Awards Card */}
          <Card className="group hover:scale-[1.02] sm:hover:scale-105 transition-all duration-300 hover:shadow-lg sm:hover:shadow-xl backdrop-blur-md bg-card/95 border-2 hover:border-primary/50">
            <Link href={MENU_ITEMS.AWARDS.href} className="block h-full">
              <CardHeader className="text-center p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl group-hover:text-primary transition-colors">
                  {MENU_ITEMS.AWARDS.icon} Fantasy {MENU_ITEMS.AWARDS.label}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base lg:text-lg">
                  Hop-themed awards tracking the best and worst performances of the season
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center p-4 sm:p-6">
                <Button className="w-full sm:w-auto bg-hop-gold hover:bg-hop-gold/90 text-hop-brown font-semibold text-sm sm:text-base">
                  View Awards →
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Team Standings Card */}
          <Card className="group hover:scale-[1.02] sm:hover:scale-105 transition-all duration-300 hover:shadow-lg sm:hover:shadow-xl backdrop-blur-md bg-card/95 border-2 hover:border-primary/50">
            <Link href={MENU_ITEMS.TEAMS.href} className="block h-full">
              <CardHeader className="text-center p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl group-hover:text-primary transition-colors">
                  {MENU_ITEMS.TEAMS.icon} {MENU_ITEMS.TEAMS.label}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base lg:text-lg">
                  Teams broken down by division with rankings, records, and top awards
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center p-4 sm:p-6">
                <Button className="w-full sm:w-auto bg-hop-gold hover:bg-hop-gold/90 text-hop-brown font-semibold text-sm sm:text-base">
                  View Standings →
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>
      </ResponsiveContainer>
    </PageContainer>
  );
}