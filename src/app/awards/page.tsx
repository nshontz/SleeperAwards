'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {SleeperAPI} from '@/lib/sleeper-api';
import {AwardsCalculator} from '@/lib/awards-calculator';
import {AwardCard} from '@/components/AwardCard';
import {AwardModal} from '@/components/AwardModal';
import {Award} from '@/types/sleeper';
import {getDefaultSleeperLeagueId} from '@/lib/default-data';

const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const CACHE_KEY = 'sleeper_awards_cache';

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [leagueName, setLeagueName] = useState('Bine to Shrine Fantasy League');
  const [user, setUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

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
      } catch (error) {
        console.error('User fetch failed:', error);
        setAuthError('Failed to load user data. Please try again.');
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadAwards();
    }
  }, [user]);

  const loadAwards = async () => {
    try {
      setLoading(true);

      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const {data, timestamp} = JSON.parse(cached);
        const now = Date.now();

        if (now - timestamp < CACHE_DURATION) {
          setAwards(data.awards);
          setLeagueName(data.leagueName);
          setLoading(false);
          return;
        }
      }
      
      // Get league ID from database
      const leagueId = await getDefaultSleeperLeagueId();
      const api = new SleeperAPI(leagueId);

      const [league, rosters, users, allMatchups] = await Promise.all([
        api.getLeague(),
        api.getRosters(),
        api.getUsers(),
        api.getAllMatchups()
      ]);

      setLeagueName(league.name);

      const calculator = new AwardsCalculator(rosters, users, allMatchups);
      const calculatedAwards = calculator.calculateAllAwards();

      setAwards(calculatedAwards);

      // Cache the data
      const cacheData = {
        data: {
          awards: calculatedAwards,
          leagueName: league.name
        },
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

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
            <a
              href="/api/auth/logout"
              className="block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold transition-colors"
            >
              Sign Out
            </a>
            <a
              href="/"
              className="block bg-hop-gold hover:bg-hop-gold/90 text-hop-brown px-6 py-2 rounded font-semibold transition-colors"
            >
              Go Home
            </a>
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
          <p className="text-gray-400 dark:text-gray-500">
            Powered by Sleeper API • Built for Yakima Chief Hops Fantasy League
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-600 mt-2">
            May your hops be fresh and your lineups be optimal 🍺
          </p>
        </div>
      </footer>
    </div>
  );
}