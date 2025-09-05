'use client';

import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {SleeperAPI} from '@/lib/sleeper-api';
import {AwardsCalculator} from '@/lib/awards-calculator';
import {AwardCard} from '@/components/AwardCard';
import {AwardModal} from '@/components/AwardModal';
import {Award} from '@/types/sleeper';


export default function AwardsPage() {
  const router = useRouter();
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [leagueName, setLeagueName] = useState('Bine to Shrine Fantasy League');
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name: string | null;
    teams: Array<{
      id: string;
      name: string;
      sleeperRosterId: string | null;
      leagueId: string;
      league: {
        sleeperLeagueId: string;
      };
    }>;
  } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check user account status (middleware handles auth)
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user');
        if (response.status === 403) {
          const data = await response.json();
          if (data.error === 'ACCOUNT_NOT_FOUND') {
            setAuthError(data.message);
            setLoading(false);
            return;
          }
        }
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        setUser(data.user);
        
        // Redirect if user has no teams
        if (!data.user.teams || data.user.teams.length === 0) {
          router.push('/join-league');
          return;
        }
      } catch (error) {
        console.error('User fetch failed:', error);
        setAuthError('Failed to load user data. Please try again.');
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (user && user.teams && user.teams.length > 0) {
      loadAwards();
    }
  }, [user]);

  const loadAwards = async () => {
    if (!user || !user.teams || user.teams.length === 0) return;
    
    try {
      setLoading(true);

      // Use the first team's league
      if (!user?.teams?.[0]?.league?.sleeperLeagueId) {
        setError('No league found for user teams');
        setLoading(false);
        return;
      }
      const sleeperLeagueId = user.teams[0].league.sleeperLeagueId;
      const dbLeagueId = user.teams[0].leagueId;
      const api = new SleeperAPI(sleeperLeagueId);

      const [league, rosters, users, allMatchups] = await Promise.all([
        api.getLeague(),
        api.getRosters(),
        api.getUsers(),
        api.getAllMatchups()
      ]);

      // Fetch award configurations from API
      const awardConfigsResponse = await fetch(`/api/leagues/${dbLeagueId}/award-configs`);
      if (!awardConfigsResponse.ok) {
        throw new Error('Failed to fetch award configurations');
      }
      const { awardConfigs } = await awardConfigsResponse.json();

      setLeagueName(league.name);

      const calculator = new AwardsCalculator(rosters, users, allMatchups, awardConfigs);
      const calculatedAwards = calculator.calculateAllAwards();

      setAwards(calculatedAwards);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load awards');
    } finally {
      setLoading(false);
    }
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hop-green to-green-800 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-white/90 mb-6">{authError}</p>
          <div className="space-y-3">
            <Link
              href="/api/auth/logout"
              className="block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold transition-colors"
            >
              Sign Out
            </Link>
            <Link
              href="/"
              className="block bg-hop-gold hover:bg-hop-gold/90 text-hop-brown px-6 py-2 rounded font-semibold transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hop-green to-green-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hop-gold mx-auto mb-4"></div>
          <p className="text-white text-xl">{!user ? 'Checking authentication...' : 'Brewing up the awards...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hop-green to-green-800 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={loadAwards}
            className="bg-hop-green text-white px-4 py-2 rounded-md hover:bg-hop-green/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🏆 Fantasy Football Awards
            </h1>
            <p className="text-xl text-hop-green dark:text-hop-gold font-semibold">
              {leagueName}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Hop-themed awards tracking the best and worst of the season
            </p>
          </div>
        </div>
      </div>

      {/* Awards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="awards-grid">
          {awards.map((award) => (
            <AwardCard
              key={award.id}
              award={award}
            />
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={loadAwards}
          className="bg-hop-gold text-gray-900 px-6 py-3 rounded-full shadow-lg hover:bg-hop-gold/90 transition-colors font-semibold"
        >
          🔄 Refresh Awards
        </button>
      </div>

      {/* Award Modal */}
      {selectedAward && (
        <AwardModal
          award={selectedAward}
          isOpen={!!selectedAward}
          onClose={() => setSelectedAward(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-600 mt-2">
            May your hops be fresh and your lineups be optimal 🍺
          </p>
        </div>
      </footer>
    </div>
  );
}