'use client';

import React from 'react';
import { Award } from '@/types/sleeper';

interface AwardCardProps {
  award: Award;
  onViewDetails: (award: Award) => void;
}

export const AwardCard: React.FC<AwardCardProps> = ({ award, onViewDetails }) => {
  return (
    <div className="award-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow  border-hop-green">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl award-icon">{award.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{award.name}</h3>
            <p className="text-sm text-gray-600">{award.description}</p>
          </div>
        </div>
      </div>
      
      {award.winner && (
        <div className="bg-hop-gold bg-opacity-20 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Current Leader</p>
              <p className="text-lg font-bold text-gray-900">{award.winner.teamName}</p>
              <p className="text-sm text-gray-600">{award.winner.details}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-hop-green">{award.winner.value}</p>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => {
          console.log('Button clicked for award:', award.name);
          onViewDetails(award);
        }}
        className="w-1/2 bg-hop-green text-white py-2 px-4 rounded-md hover:bg-hop-green/90 transition-colors"
      >
        View Full Leaderboard
      </button>
    </div>
  );
};