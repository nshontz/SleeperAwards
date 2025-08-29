'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Card className="backdrop-blur-md bg-card/95 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">🍺 Join a League 🍺</CardTitle>
            <CardDescription>
              Connect your Sleeper league to get started with BineTime
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* League ID Input */}
            <div className="space-y-2">
              <Label htmlFor="leagueId">Sleeper League ID</Label>
              <div className="flex gap-3">
                <Input
                  id="leagueId"
                  value={leagueId}
                  onChange={(e) => setLeagueId(e.target.value)}
                  placeholder="Enter your Sleeper league ID (e.g., 1234567890123456789)"
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  onClick={fetchLeagueTeams}
                  disabled={loading || !leagueId.trim()}
                  className="bg-hop-gold hover:bg-hop-gold/90 text-hop-brown font-semibold"
                >
                  {loading ? 'Loading...' : 'Fetch Teams'}
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                You can find your league ID in your Sleeper app URL or league settings.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {leagueData && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{leagueData.league.name}</CardTitle>
                    <CardDescription className="flex gap-4 text-sm">
                      <Badge variant="secondary">Season: {leagueData.league.season}</Badge>
                      <Badge variant="secondary">Teams: {leagueData.league.totalTeams}</Badge>
                      <Badge variant={leagueData.league.status === 'in_season' ? 'default' : 'secondary'}>
                        Status: {leagueData.league.status}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Select Your Team</h3>
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
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
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1">
                                {team.teamName}
                              </h4>
                              <p className="text-muted-foreground text-sm mb-2">
                                Owner: {team.displayName || team.username}
                              </p>
                              <div className="flex gap-4 text-sm">
                                <Badge variant="outline">
                                  Record: {team.wins}-{team.losses}{team.ties > 0 && `-${team.ties}`}
                                </Badge>
                                <Badge variant="outline">
                                  Points: {team.points}
                                </Badge>
                                <Badge variant="outline">
                                  PA: {team.pointsAgainst}
                                </Badge>
                              </div>
                            </div>
                            {selectedTeam?.rosterId === team.rosterId && (
                              <div className="text-hop-gold">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
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
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-semibold">
                            Selected: {selectedTeam.teamName}
                          </h4>
                          <p className="text-muted-foreground">
                            This will be your team in {leagueData.league.name}
                          </p>
                        </div>
                        <Button
                          onClick={joinLeague}
                          disabled={joining}
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold"
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
      </div>
    </div>
  );
}