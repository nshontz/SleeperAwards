'use client';

import React from 'react';
import { Award } from '@/types/sleeper';

interface AwardModalProps {
  award: Award;
  isOpen: boolean;
  onClose: () => void;
}

export const AwardModal: React.FC<AwardModalProps> = ({ award, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-hop-green dark:bg-gray-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{award.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{award.name}</h2>
                <p className="text-hop-gold dark:text-hop-gold">{award.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-hop-gold text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {award.leaderboard.map((entry, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? 'bg-hop-gold bg-opacity-30 dark:bg-hop-gold dark:bg-opacity-40 border-2 border-hop-gold' :
                  index === 1 ? 'bg-gray-200 dark:bg-gray-700' :
                  index === 2 ? 'bg-amber-100 dark:bg-amber-900/30' :
                  'bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-hop-gold' :
                    index === 1 ? 'bg-gray-400 dark:bg-gray-500' :
                    index === 2 ? 'bg-amber-500' :
                    'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {entry.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{entry.teamName}</p>
                    {entry.details && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{entry.details}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{entry.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};