'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { SleeperAPI } from '@/lib/sleeper-api';
import { SleeperLeague, SleeperRoster, SleeperUser, SleeperMatchup, SleeperPlayer, TrendingPlayer } from '@/types/sleeper';
import { getDefaultSleeperLeagueId } from '@/lib/default-data';

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

interface PlayerRecommendation {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  recommendation: 'start' | 'sit' | 'pickup';
  reason: string;
  priority: 'high' | 'medium' | 'low';
  projectedPoints?: number;
}

interface TeamData {
  roster: SleeperRoster;
  user: SleeperUser;
  teamName: string;
  recentMatchups: SleeperMatchup[];
  startRecommendations: PlayerRecommendation[];
  pickupRecommendations: PlayerRecommendation[];
  rosterPlayers: SleeperPlayer[];
}

export default function TeamPage({ params }: TeamPageProps) {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unwrap the params Promise
  const resolvedParams = use(params);
  const teamId = parseInt(resolvedParams.teamId);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        setLoading(true);
        const leagueId = await getDefaultSleeperLeagueId();
        const sleeperApi = new SleeperAPI(leagueId);

        // Fetch basic data
        const [league, rosters, users, allMatchups, allPlayers, trendingPlayers] = await Promise.all([
          sleeperApi.getLeague(),
          sleeperApi.getRosters(),
          sleeperApi.getUsers(),
          sleeperApi.getAllMatchups(),
          sleeperApi.getAllPlayers(),
          sleeperApi.getTrendingPlayers('add', 24)
        ]);

        // Find the specific team
        const roster = rosters.find(r => r.roster_id === teamId);
        if (!roster) {
          throw new Error('Team not found');
        }

        const user = users.find(u => u.user_id === roster.owner_id);
        const teamName = user?.metadata?.team_name || user?.display_name || `Team ${teamId}`;

        // Get recent matchups for this team
        const recentMatchups = allMatchups
          .flat()
          .filter(m => m.roster_id === teamId)
          .slice(-5); // Last 5 games

        // Get roster players with full details
        const rosterPlayers = (roster.players || [])
          .map(playerId => allPlayers[playerId])
          .filter(Boolean)
          .map(player => ({
            player_id: player.player_id,
            first_name: player.first_name || '',
            last_name: player.last_name || '',
            full_name: player.full_name || `${player.first_name} ${player.last_name}`,
            position: player.position || 'UNKNOWN',
            team: player.team || 'FA',
            status: player.status || 'Active',
            fantasy_positions: player.fantasy_positions || [player.position],
            injury_status: player.injury_status,
            years_exp: player.years_exp,
            height: player.height,
            weight: player.weight,
            age: player.age
          }));

        // Generate recommendations using real data
        const startRecommendations = generateStartSitRecommendations(roster, recentMatchups, rosterPlayers, allMatchups);
        const pickupRecommendations = generatePickupRecommendations(roster, rosters, trendingPlayers, allPlayers);

        setTeamData({
          roster,
          user: user!,
          teamName,
          recentMatchups,
          startRecommendations,
          pickupRecommendations,
          rosterPlayers
        });

      } catch (err) {
        console.error('Error fetching team data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load team data');
      } finally {
        setLoading(false);
      }
    }

    fetchTeamData();
  }, [teamId]);

  // Enhanced recommendation engine using real roster data
  function generateStartSitRecommendations(
    roster: SleeperRoster, 
    matchups: SleeperMatchup[], 
    rosterPlayers: SleeperPlayer[],
    allMatchups: SleeperMatchup[][]
  ): PlayerRecommendation[] {
    const recommendations: PlayerRecommendation[] = [];
    
    // Calculate player performance from recent matchups
    const teamMatchups = allMatchups.flat().filter(m => m.roster_id === roster.roster_id);
    
    // Get starters and bench players
    const starters = (roster.starters || [])
      .map(playerId => rosterPlayers.find(p => p.player_id === playerId))
      .filter((player): player is SleeperPlayer => Boolean(player));
      
    const benchPlayers = rosterPlayers.filter(player => 
      !roster.starters?.includes(player.player_id)
    );

    // Analyze starters for start/sit recommendations
    starters.forEach(player => {
      const avgPoints = calculatePlayerAverage(player.player_id, teamMatchups);
      const recentForm = getRecentForm(player.player_id, teamMatchups.slice(-3));
      const isInjured = player.injury_status && player.injury_status !== 'Healthy';
      
      if (isInjured) {
        recommendations.push({
          playerId: player.player_id,
          playerName: player.full_name,
          position: player.position,
          team: player.team,
          recommendation: 'sit',
          reason: `Injury concern: ${player.injury_status}. Monitor status before game time.`,
          priority: 'high',
          projectedPoints: avgPoints * 0.5
        });
      } else if (avgPoints > 12 && recentForm > avgPoints * 0.8) {
        recommendations.push({
          playerId: player.player_id,
          playerName: player.full_name,
          position: player.position,
          team: player.team,
          recommendation: 'start',
          reason: `Strong performer with ${avgPoints?.toFixed(1)} avg points. Good recent form.`,
          priority: 'high',
          projectedPoints: avgPoints + (recentForm - avgPoints) * 0.3
        });
      } else if (avgPoints < 8 || recentForm < avgPoints * 0.6) {
        recommendations.push({
          playerId: player.player_id,
          playerName: player.full_name,
          position: player.position,
          team: player.team,
          recommendation: 'sit',
          reason: `Inconsistent performance (${avgPoints?.toFixed(1)} avg). Consider bench options.`,
          priority: 'medium',
          projectedPoints: Math.max(avgPoints * 0.8, recentForm)
        });
      }
    });

    // Analyze top bench players for potential starts
    benchPlayers
      .filter(player => ['QB', 'RB', 'WR', 'TE'].includes(player.position))
      .slice(0, 3)
      .forEach(player => {
        const avgPoints = calculatePlayerAverage(player.player_id, teamMatchups);
        if (avgPoints > 8) {
          recommendations.push({
            playerId: player.player_id,
            playerName: player.full_name,
            position: player.position,
            team: player.team,
            recommendation: 'start',
            reason: `Solid bench option with ${avgPoints?.toFixed(1)} avg points. Consider over struggling starters.`,
            priority: 'medium',
            projectedPoints: avgPoints
          });
        }
      });

    return recommendations.slice(0, 8); // Limit recommendations
  }

  // Helper functions for player analysis
  function calculatePlayerAverage(playerId: string, matchups: SleeperMatchup[]): number {
    const playerPoints = matchups
      .map(m => m.players_points?.[playerId] || 0)
      .filter(points => points > 0);
    
    return playerPoints.length > 0 
      ? playerPoints.reduce((sum, points) => sum + points, 0) / playerPoints.length 
      : 0;
  }

  function getRecentForm(playerId: string, recentMatchups: SleeperMatchup[]): number {
    const recentPoints = recentMatchups
      .map(m => m.players_points?.[playerId] || 0)
      .filter(points => points > 0);
    
    return recentPoints.length > 0
      ? recentPoints.reduce((sum, points) => sum + points, 0) / recentPoints.length
      : 0;
  }

  // Enhanced pickup recommendations using trending players
  function generatePickupRecommendations(
    roster: SleeperRoster, 
    allRosters: SleeperRoster[], 
    trendingPlayers: TrendingPlayer[],
    allPlayers: Record<string, SleeperPlayer>
  ): PlayerRecommendation[] {
    const recommendations: PlayerRecommendation[] = [];
    
    // Get all rostered players across the league
    const rosteredPlayerIds = new Set(
      allRosters.flatMap(r => [...(r.players || []), ...(r.starters || [])])
    );

    // Filter trending players that are available (not rostered)
    const availableTrendingPlayers = trendingPlayers
      .filter(tp => !rosteredPlayerIds.has(tp.player_id))
      .slice(0, 10)
      .map(tp => ({
        ...tp,
        player: allPlayers[tp.player_id]
      }))
      .filter(tp => tp.player && ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(tp.player.position));

    // Analyze team needs based on current roster
    const positionCounts = (roster.players || [])
      .map(playerId => allPlayers[playerId]?.position)
      .filter(Boolean)
      .reduce((counts, pos) => {
        counts[pos] = (counts[pos] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

    availableTrendingPlayers.forEach((trendingPlayer, index) => {
      const player = trendingPlayer.player;
      const isPositionNeeded = (positionCounts[player.position] || 0) < 3;
      
      let reason = `Trending pickup (${trendingPlayer.count} adds). `;
      if (player.injury_status && player.injury_status !== 'Healthy') {
        reason += `Monitor injury: ${player.injury_status}.`;
      } else if (isPositionNeeded) {
        reason += `Addresses ${player.position} depth need.`;
      } else {
        reason += `Popular waiver target with upside potential.`;
      }

      recommendations.push({
        playerId: player.player_id,
        playerName: player.full_name || `${player.first_name} ${player.last_name}`,
        position: player.position,
        team: player.team || 'FA',
        recommendation: 'pickup',
        reason,
        priority: index < 3 ? 'high' : index < 6 ? 'medium' : 'low',
        projectedPoints: 6 + Math.random() * 10 + (isPositionNeeded ? 2 : 0)
      });
    });

    return recommendations.slice(0, 6);
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hop-gold mb-4 mx-auto"></div>
            <p className="text-white text-lg">Loading team data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !teamData) {
    return (
      <div className="page-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <p className="text-xl mb-4">🚫 {error || 'Team not found'}</p>
            <Link href="/teams" className="btn-primary">
              ← Back to Teams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{teamData.teamName}</h1>
          <p className="text-hop-gold text-lg">Team Analysis & Recommendations</p>
          <div className="mt-4">
            <Link href="/teams" className="btn-secondary">
              ← Back to All Teams
            </Link>
          </div>
        </div>

        {/* Team Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="theme-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">📊 Season Stats</h3>
            <div className="space-y-2 text-white">
              <p><span className="text-hop-gold">Record:</span> {teamData.roster.settings?.wins}-{teamData.roster.settings?.losses}-{teamData.roster.settings?.ties}</p>
              <p><span className="text-hop-gold">Points For:</span> {teamData.roster.settings?.fpts?.toFixed(1)}</p>
              <p><span className="text-hop-gold">Points Against:</span> {teamData.roster.settings?.fpts_against?.toFixed(1)}</p>
              <p><span className="text-hop-gold">Point Differential:</span> {(teamData.roster.settings?.fpts - teamData.roster.settings?.fpts_against)?.toFixed(1)}</p>
            </div>
          </div>

          <div className="theme-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">🎯 Recent Form</h3>
            <div className="space-y-2 text-white">
              <p><span className="text-hop-gold">Last 5 Games Avg:</span> {teamData.recentMatchups.length > 0 ? (teamData.recentMatchups.reduce((sum, m) => sum + m.points, 0) / teamData.recentMatchups.length)?.toFixed(1) : 'N/A'} pts</p>
              <p><span className="text-hop-gold">Best Game:</span> {teamData.recentMatchups.length > 0 ? Math.max(...teamData.recentMatchups.map(m => m.points))?.toFixed(1) : 'N/A'} pts</p>
              <p><span className="text-hop-gold">Worst Game:</span> {teamData.recentMatchups.length > 0 ? Math.min(...teamData.recentMatchups.map(m => m.points))?.toFixed(1) : 'N/A'} pts</p>
            </div>
          </div>

          <div className="theme-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">🏆 Outlook</h3>
            <div className="space-y-2 text-white">
              <p><span className="text-hop-gold">Playoff Chances:</span> {teamData.roster.settings?.wins >= 6 ? 'Strong' : teamData.roster.settings?.wins >= 4 ? 'Moderate' : 'Needs Help'}</p>
              <p><span className="text-hop-gold">Strength:</span> {teamData.roster.settings?.fpts > 1200 ? 'High Scoring' : 'Consistent'}</p>
              <p><span className="text-hop-gold">Weakness:</span> {teamData.roster.settings?.fpts_against > 1200 ? 'Poor Defense' : 'Low Scoring'}</p>
            </div>
          </div>
        </div>

        {/* Start/Sit Recommendations */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">🎮 Start/Sit Recommendations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Start Recommendations */}
            <div className="theme-card p-6">
              <h3 className="text-xl font-bold text-hop-gold mb-4">✅ Recommended Starts</h3>
              <div className="space-y-4">
                {teamData.startRecommendations.filter(r => r.recommendation === 'start').map((rec, idx) => (
                  <div key={idx} className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white">{rec.playerName}</h4>
                        <p className="text-sm text-gray-300">{rec.position} - {rec.team}</p>
                      </div>
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{rec.reason}</p>
                    {rec.projectedPoints && (
                      <p className="text-hop-gold text-sm font-semibold">
                        Projected: {rec.projectedPoints?.toFixed(1)} pts
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sit Recommendations */}
            <div className="theme-card p-6">
              <h3 className="text-xl font-bold text-hop-gold mb-4">⚠️ Consider Sitting</h3>
              <div className="space-y-4">
                {teamData.startRecommendations.filter(r => r.recommendation === 'sit').map((rec, idx) => (
                  <div key={idx} className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white">{rec.playerName}</h4>
                        <p className="text-sm text-gray-300">{rec.position} - {rec.team}</p>
                      </div>
                      <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-bold">
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{rec.reason}</p>
                    {rec.projectedPoints && (
                      <p className="text-hop-gold text-sm font-semibold">
                        Projected: {rec.projectedPoints?.toFixed(1)} pts
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Roster */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">👥 Current Roster</h2>
          <div className="theme-card p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamData.rosterPlayers
                .sort((a, b) => {
                  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
                  return positions.indexOf(a.position) - positions.indexOf(b.position);
                })
                .map((player, idx) => (
                <div key={idx} className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{player.full_name}</h4>
                      <p className="text-xs text-gray-300">{player.position} - {player.team}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                        teamData.roster.starters?.includes(player.player_id) ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {teamData.roster.starters?.includes(player.player_id) ? 'STARTER' : 'BENCH'}
                      </span>
                    </div>
                  </div>
                  {player.injury_status && player.injury_status !== 'Healthy' && (
                    <p className="text-red-400 text-xs">⚠️ {player.injury_status}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {player.years_exp ? `${player.years_exp} years exp` : 'Rookie'} • Age {player.age || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pickup Recommendations */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">🔍 Waiver Wire Targets</h2>
          <div className="theme-card p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamData.pickupRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-white">{rec.playerName}</h4>
                      <p className="text-sm text-gray-300">{rec.position} - {rec.team}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                      rec.priority === 'high' ? 'bg-red-600' :
                      rec.priority === 'medium' ? 'bg-orange-600' : 'bg-gray-600'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{rec.reason}</p>
                  {rec.projectedPoints && (
                    <p className="text-hop-gold text-sm font-semibold">
                      Projected: {rec.projectedPoints?.toFixed(1)} pts
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            * Recommendations are generated based on recent performance and league trends. 
            Always consider injury reports and matchup analysis before making final decisions.
          </p>
        </div>
      </div>
    </div>
  );
}