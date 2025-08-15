'use client';

import React, {useEffect, useState} from 'react';
import {SleeperAPI} from '@/lib/sleeper-api';
import {AwardsCalculator} from '@/lib/awards-calculator';
import {AwardCard} from '@/components/AwardCard';
import {AwardModal} from '@/components/AwardModal';
import {Award} from '@/types/sleeper';

const LEAGUE_ID: string = process.env.NEXT_PUBLIC_LEAGUE_ID || '';
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const CACHE_KEY = 'sleeper_awards_cache';

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [leagueName, setLeagueName] = useState('Bine to Shrine Fantasy League');

  useEffect(() => {
    if (LEAGUE_ID === '') {
      throw new Error('NEXT_PUBLIC_LEAGUE_ID environment variable is required');
    }

    loadAwards();
  }, []);

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
      const api = new SleeperAPI(LEAGUE_ID);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hop-green to-green-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hop-gold mx-auto mb-4"></div>
          <p className="text-white text-xl">Brewing up the awards...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-hop-green to-green-800 dark:from-gray-900 dark:to-black">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
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
        <div className="grid grid-cols-3" style={{gap: '30px'}}>
          {awards.map((award) => (
            <AwardCard
              key={award.id}
              award={award}
              onViewDetails={(award) => {
                console.log('Setting selected award:', award.name);
                setSelectedAward(award);
              }}
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