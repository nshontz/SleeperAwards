'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SleeperAPI } from '@/lib/sleeper-api';
import { AwardsCalculator } from '@/lib/awards-calculator';
import { SleeperLeague, SleeperRoster, SleeperUser, Award } from '@/types/sleeper';

interface TeamWithStats extends SleeperRoster {
  teamName: string;
  rank: number;
  totalPoints: number;
  averagePoints: number;
  pointsAgainst: number;
  topAwards: Array<{ name: string; rank: number }>;
}

interface Division {
  name: string;
  teams: TeamWithStats[];
}

export default function TeamsPage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const sleeperApi = new SleeperAPI(process.env.NEXT_PUBLIC_LEAGUE_ID || '');

        // Fetch league data
        const league = await sleeperApi.getLeague();
        const rosters = await sleeperApi.getRosters();
        const users = await sleeperApi.getUsers();
        const matchups = await sleeperApi.getAllMatchups();


        // Calculate awards for team rankings
        const awardsCalculator = new AwardsCalculator(rosters, users, matchups);
        const calculatedAwards = awardsCalculator.calculateAllAwards();

        // Process teams with stats
        const teamsWithStats: TeamWithStats[] = rosters.map((roster) => {
          const user = users.find(u => u.user_id === roster.owner_id);
          const teamName = user?.metadata?.team_name || user?.display_name || `Team ${roster.roster_id}`;
          
          // Calculate total points from matchups
          const teamMatchups = matchups.flat().filter(m => m.roster_id === roster.roster_id);
          const totalPoints = teamMatchups.reduce((sum, matchup) => sum + (matchup.points || 0), 0);
          const averagePoints = teamMatchups.length > 0 ? totalPoints / teamMatchups.length : 0;

          // Find top 3 award rankings for this team
          const topAwards = calculatedAwards
            .map(award => {
              const teamRank = award.leaderboard.findIndex(entry => entry.teamName === teamName) + 1;
              return teamRank > 0 ? { name: award.name, rank: teamRank } : null;
            })
            .filter(Boolean)
            .sort((a, b) => a!.rank - b!.rank)
            .slice(0, 3) as Array<{ name: string; rank: number }>;

          return {
            ...roster,
            teamName,
            rank: 0, // Will be set after sorting
            totalPoints,
            averagePoints,
            pointsAgainst: roster.settings.fpts_against,
            topAwards
          };
        });

        // Sort teams by total points and assign ranks
        const sortedTeams = teamsWithStats
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((team, index) => ({ ...team, rank: index + 1 }));

        // Use Sleeper divisions if available, otherwise create manual divisions
        let divisions: Division[] = [];
        
        // Check if league has division settings
        const hasDivisions = league.settings?.divisions && league.settings.divisions > 1;
        
        if (hasDivisions) {
          // Create divisions based on Sleeper division assignments
          const divisionNames = [
            league.metadata?.division_1 || 'Division 1',
            league.metadata?.division_2 || 'Division 2',
            league.metadata?.division_3 || 'Division 3',
            league.metadata?.division_4 || 'Division 4'
          ];
          
          // Group teams by division
          const divisionTeams: Record<number, TeamWithStats[]> = {};
          
          sortedTeams.forEach(team => {
            const divisionId = team.settings.division || 1; // Default to division 1 if not set
            if (!divisionTeams[divisionId]) {
              divisionTeams[divisionId] = [];
            }
            divisionTeams[divisionId].push(team);
          });
          
          // Create division objects
          divisions = Object.entries(divisionTeams).map(([divId, teams]) => {
            const divisionIndex = parseInt(divId) - 1;
            return {
              name: divisionNames[divisionIndex] || `Division ${divId}`,
              teams: teams.sort((a, b) => b.totalPoints - a.totalPoints) // Sort within division
            };
          });
        } else {
          // Fallback: Create manual divisions (Hop/Malt theme)
          const midPoint = Math.ceil(sortedTeams.length / 2);
          divisions = [
            {
              name: 'Hop Division',
              teams: sortedTeams.slice(0, midPoint)
            },
            {
              name: 'Malt Division', 
              teams: sortedTeams.slice(midPoint)
            }
          ];
        }

        setDivisions(divisions);
        setAwards(calculatedAwards);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data. Please try again later.');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hop-green to-hop-brown flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hop-gold mb-4"></div>
          <p className="text-white text-lg">Loading team standings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hop-green to-hop-brown flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">🍺 Oops! Something went wrong</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🏆 Team Standings</h1>
          <p className="text-hop-gold text-lg">Teams ranked by total points scored</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Leaderboard Column */}
          <div className="lg:col-span-2 leaderboard">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">📊 Team Standings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {divisions.map((division) => (
                <div key={division.name} className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-lg p-6">
                  <h3 className="text-xl font-bold text-hop-gold mb-4 text-center">
                    {division.name}
                  </h3>
                  
                  <div className="space-y-3">
                    {division.teams.map((team) => (
                      <div 
                        key={team.roster_id}
                        className="bg-white/20 dark:bg-gray-700/50 rounded-lg p-3 hover:bg-white/30 dark:hover:bg-gray-600/60 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="bg-hop-gold text-hop-brown font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs">
                              {team.rank}
                            </span>
                            <h4 className="font-semibold text-white text-sm">{team.teamName}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-hop-gold font-bold text-sm">{team.settings.wins}-{team.settings.losses}</p>
                            <p className="text-white/80 text-xs">{team.totalPoints.toFixed(1)} pts</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-white/90 dark:text-gray-300">
                          <div>
                            <p>Avg: {team.averagePoints.toFixed(1)}</p>
                            <p>Against: {team.pointsAgainst?.toFixed(1)}</p>
                          </div>
                          <div>
                            {team.topAwards.length > 0 && (
                              <div>
                                <p className="text-hop-gold font-medium">Awards:</p>
                                <p className="text-xs">
                                  #{team.topAwards[0].rank} {team.topAwards[0].name.replace(/^The /, '').substring(0, 15)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Awards Summary Column */}
          <div className="awards-summary">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">🏅 Award Leaders</h2>
            <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-lg p-6">
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
                {awards.filter(award => award.winner).map((award) => (
                  <div key={award.id} className="bg-white/20 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-white/30 dark:hover:bg-gray-600/60 transition-all">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl flex-shrink-0">{award.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white dark:text-gray-200 text-sm mb-1 leading-tight">
                          {award.name}
                        </h3>
                        {award.winner && (
                          <div className="text-hop-gold">
                            <p className="font-bold text-sm truncate">{award.winner.teamName}</p>
                            <p className="text-xs text-white/90 dark:text-gray-400">{award.winner.value}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}