'use client';

import React from 'react';
import { Award } from '@/types/sleeper';

interface AwardCardProps {
  award: Award;
}

export const AwardCard: React.FC<AwardCardProps> = ({ award }) => {
  return (
    <div className="award-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-hop-green">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl award-icon">{award.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{award.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{award.description}</p>
          </div>
        </div>
      </div>
      
      {award.winner && (
        <div className="bg-hop-gold bg-opacity-20 dark:bg-hop-gold dark:bg-opacity-30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Leader</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{award.winner.teamName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{award.winner.details}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-hop-green dark:text-hop-gold">{award.winner.value}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};