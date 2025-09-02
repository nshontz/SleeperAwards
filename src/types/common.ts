// Common types used across the application

export type ThemeMode = 'light' | 'dark' | 'system';

// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  teams: UserTeam[];
}

export interface UserTeam {
  id: string;
  name: string;
  sleeperRosterId: string | null;
  leagueId: string;
  league?: {
    id: string;
    name: string;
    sleeperLeagueId: string;
  };
}

// Next.js API Route types
export interface RouteParams {
  params: Record<string, string>;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
}

// League joining types  
export interface LeagueJoinRequest {
  sleeperLeagueId: string;
  sleeperRosterId: number;
  teamName: string;
  leagueName?: string;
}

export interface LeagueJoinResponse {
  success: boolean;
  team?: {
    id: string;
    name: string;
    sleeperRosterId: string;
    league: {
      id: string;
      name: string;
      sleeperLeagueId: string;
    };
  };
  error?: string;
}