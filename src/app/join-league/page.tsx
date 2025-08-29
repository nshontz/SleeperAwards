'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageContainer, ResponsiveContainer } from '@/components/ui/responsive-container';
import { SkipLinks, LoadingAnnouncement, AnnouncementRegion } from '@/components/ui/accessibility';
import { SleeperTeam, SleeperLeagueSimple } from '@/types/sleeper';

interface LeagueData {
  league: SleeperLeagueSimple;
  teams: SleeperTeam[];
}

export default function JoinLeaguePage() {
  const [leagueId, setLeagueId] = useState('');
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<SleeperTeam | null>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchLeagueTeams = async () => {
    if (!leagueId.trim()) {
      setError('Please enter a league ID');
      return;
    }

    setLoading(true);
    setError('');
    setLeagueData(null);
    setSelectedTeam(null);

    try {
      const response = await fetch(`/api/sleeper/leagues/${leagueId}/teams`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('League not found. Please check the league ID.');
        }
        throw new Error('Failed to fetch league data');
      }

      const data = await response.json();
      setLeagueData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const joinLeague = async () => {
    if (!selectedTeam || !leagueData) {
      setError('Please select a team');
      return;
    }

    setJoining(true);
    setError('');

    try {
      const response = await fetch('/api/leagues/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sleeperLeagueId: leagueData.league.id,
          sleeperRosterId: selectedTeam.rosterId,
          teamName: selectedTeam.teamName,
          leagueName: leagueData.league.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join league');
      }

      // Redirect to teams page on success
      router.push('/teams');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setJoining(false);
    }
  };

  return (
    <>
      <SkipLinks />
      <PageContainer>
        <ResponsiveContainer maxWidth="4xl" className="py-6 sm:py-8">
          <main id="main-content">
            <Card className="backdrop-blur-md bg-card/95 shadow-xl sm:shadow-2xl">
              <CardHeader className="text-center p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  <span role="img" aria-label="beer mug">🍺</span> Join a League <span role="img" aria-label="beer mug">🍺</span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Connect your Sleeper league to get started with BineTime
                </CardDescription>
              </CardHeader>
          
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <LoadingAnnouncement isLoading={loading} message="Loading league data" />
                <AnnouncementRegion priority="polite">
                  {error && `Error: ${error}`}
                  {leagueData && `League ${leagueData.league.name} loaded successfully with ${leagueData.teams.length} teams`}
                  {joining && 'Joining league...'}
                </AnnouncementRegion>
                
                {/* League ID Input */}
                <fieldset className="space-y-2 sm:space-y-3">
                  <legend className="sr-only">League Connection</legend>
                  <Label htmlFor="leagueId" className="text-sm sm:text-base font-medium">Sleeper League ID</Label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Input
                      id="leagueId"
                      value={leagueId}
                      onChange={(e) => setLeagueId(e.target.value)}
                      placeholder="Enter your Sleeper league ID"
                      disabled={loading}
                      className="flex-1 text-sm sm:text-base"
                      aria-describedby="league-id-help"
                      aria-required="true"
                    />
                    <Button
                      onClick={fetchLeagueTeams}
                      disabled={loading || !leagueId.trim()}
                      className="w-full sm:w-auto whitespace-nowrap bg-hop-gold hover:bg-hop-gold/90 text-hop-brown font-semibold text-sm sm:text-base"
                      aria-describedby="fetch-teams-description"
                    >
                      {loading ? 'Loading...' : 'Fetch Teams'}
                    </Button>
                  </div>
                  <p id="league-id-help" className="text-muted-foreground text-xs sm:text-sm">
                    You can find your league ID in your Sleeper app URL or league settings.
                  </p>
                  <div id="fetch-teams-description" className="sr-only">
                    This will load all teams from your Sleeper league so you can select yours
                  </div>
                </fieldset>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {leagueData && (
              <div className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl">{leagueData.league.name}</CardTitle>
                    <CardDescription className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                      <Badge variant="secondary">Season: {leagueData.league.season}</Badge>
                      <Badge variant="secondary">Teams: {leagueData.league.totalTeams}</Badge>
                      <Badge variant={leagueData.league.status === 'in_season' ? 'default' : 'secondary'}>
                        Status: {leagueData.league.status}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Select Your Team</h3>
                  <div className="grid gap-2 sm:gap-3 max-h-64 sm:max-h-96 overflow-y-auto">
                    {leagueData.teams.map((team) => (
                      <Card
                        key={team.rosterId}
                        onClick={() => setSelectedTeam(team)}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTeam?.rosterId === team.rosterId
                            ? 'ring-2 ring-hop-gold bg-accent'
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 truncate">
                                {team.teamName}
                              </h4>
                              <p className="text-muted-foreground text-xs sm:text-sm mb-2 truncate">
                                Owner: {team.displayName || team.username}
                              </p>
                              <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm">
                                <Badge variant="outline" className="text-xs">
                                  {team.wins}-{team.losses}{team.ties > 0 && `-${team.ties}`}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {team.points} pts
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {team.pointsAgainst} PA
                                </Badge>
                              </div>
                            </div>
                            {selectedTeam?.rosterId === team.rosterId && (
                              <div className="text-hop-gold flex-shrink-0 ml-2">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {selectedTeam && (
                  <Card className="border-t">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                        <div className="flex-1">
                          <h4 className="text-base sm:text-lg font-semibold">
                            Selected: {selectedTeam.teamName}
                          </h4>
                          <p className="text-muted-foreground text-xs sm:text-sm">
                            This will be your team in {leagueData.league.name}
                          </p>
                        </div>
                        <Button
                          onClick={joinLeague}
                          disabled={joining}
                          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold text-sm sm:text-base"
                        >
                          {joining ? 'Joining...' : 'Join League'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </ResponsiveContainer>
    </PageContainer>
  );
}