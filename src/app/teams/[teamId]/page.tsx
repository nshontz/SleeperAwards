'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { SleeperAPI } from '@/lib/sleeper-api';
import { SleeperRoster, SleeperUser, SleeperMatchup, SleeperPlayer } from '@/types/sleeper';
import { getDefaultSleeperLeagueId } from '@/lib/default-data';

interface TeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}


interface TeamData {
  roster: SleeperRoster;
  user: SleeperUser;
  teamName: string;
  recentMatchups: SleeperMatchup[];
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
        const [, rosters, users, allMatchups, allPlayers] = await Promise.all([
          sleeperApi.getLeague(),
          sleeperApi.getRosters(),
          sleeperApi.getUsers(),
          sleeperApi.getAllMatchups(),
          sleeperApi.getAllPlayers()
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


        setTeamData({
          roster,
          user: user!,
          teamName,
          recentMatchups,
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


        {/* Current Roster */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">👥 Current Roster</h2>
          <div className="theme-card p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamData.rosterPlayers
                .sort((a, b) => {
                  const isStarterA = teamData.roster.starters?.includes(a.player_id);
                  const isStarterB = teamData.roster.starters?.includes(b.player_id);
                  
                  // Starters first
                  if (isStarterA && !isStarterB) return -1;
                  if (!isStarterA && isStarterB) return 1;
                  
                  // Within starters, sort by position order
                  if (isStarterA && isStarterB) {
                    const starterPositions = ['QB', 'WR', 'RB', 'TE', 'K', 'DEF'];
                    return starterPositions.indexOf(a.position) - starterPositions.indexOf(b.position);
                  }
                  
                  // Within bench, sort by position order
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
                    {player.position === 'DEF' 
                      ? `Team Defense` 
                      : `${player.years_exp ? `${player.years_exp} years exp` : 'Rookie'} • Age ${player.age || 'N/A'}`
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}