'use client';

import { useState, useEffect } from 'react';
// Using inline SVG instead of heroicons to avoid dependency issues

interface Team {
  id: string;
  name: string;
  sleeperRosterId: string | null;
  leagueId: string;
  league: {
    id: string;
    name: string;
    sleeperLeagueId: string;
  };
}

interface TeamSelectorProps {
  onTeamChange?: (team: Team) => void;
  className?: string;
}

export function TeamSelector({ onTeamChange, className = '' }: TeamSelectorProps) {
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveTeam();
  }, []);

  const fetchActiveTeam = async () => {
    try {
      const response = await fetch('/api/active-team');
      if (response.ok) {
        const data = await response.json();
        setActiveTeam(data.activeTeam);
        setAllTeams(data.allTeams);
      }
    } catch (error) {
      console.error('Error fetching active team:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectTeam = async (team: Team) => {
    try {
      const response = await fetch('/api/active-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId: team.id }),
      });

      if (response.ok) {
        setActiveTeam(team);
        setIsOpen(false);
        onTeamChange?.(team);
      }
    } catch (error) {
      console.error('Error setting active team:', error);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-white/20 rounded-lg p-3 ${className}`}>
        <div className="h-4 bg-white/30 rounded w-24"></div>
      </div>
    );
  }

  if (!activeTeam || allTeams.length === 0) {
    return null;
  }

  // If user only has one team, show it without dropdown
  if (allTeams.length === 1) {
    return (
      <div className={`bg-white/10 backdrop-blur-md rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-hop-gold rounded-full"></div>
          <div>
            <p className="text-white font-semibold text-sm">{activeTeam.name}</p>
            <p className="text-white/70 text-xs">{activeTeam.league.name}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/10 backdrop-blur-md rounded-lg p-3 text-left hover:bg-white/20 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-hop-gold rounded-full"></div>
            <div>
              <p className="text-white font-semibold text-sm">{activeTeam.name}</p>
              <p className="text-white/70 text-xs">{activeTeam.league.name}</p>
            </div>
          </div>
          <svg 
            className={`w-5 h-5 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20 z-50">
          <div className="p-2">
            <p className="text-gray-700 font-semibold text-xs uppercase tracking-wide px-3 py-2">
              Switch Team
            </p>
            {allTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => selectTeam(team)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-hop-green/10 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium text-sm">{team.name}</p>
                    <p className="text-gray-600 text-xs">{team.league.name}</p>
                  </div>
                  {activeTeam.id === team.id && (
                    <svg className="w-4 h-4 text-hop-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}