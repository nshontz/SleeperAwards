export interface SleeperLeague {
    league_id: string;
    name: string;
    total_rosters: number;
    status: string;
    season: string;
    scoring_settings: Record<string, number>;
    roster_positions: string[];
  }
  
  export interface SleeperRoster {
    roster_id: number;
    owner_id: string;
    players: string[];
    starters: string[];
    settings: {
      wins: number;
      losses: number;
      ties: number;
      fpts: number;
      fpts_against: number;
      fpts_decimal: number;
      fpts_against_decimal: number;
    };
  }
  
  export interface SleeperUser {
    user_id: string;
    username: string;
    display_name: string;
    metadata?: {
      team_name?: string;
    };
  }
  
  export interface SleeperMatchup {
    roster_id: number;
    matchup_id: number;
    points: number;
    starters: string[];
    players: string[];
    starters_points?: number[];
    players_points?: Record<string, number>;
  }
  
  export interface Award {
    id: string;
    name: string;
    description: string;
    icon: string;
    winner?: {
      teamName: string;
      value: number | string;
      details?: string;
    };
    leaderboard: Array<{
      rank: number;
      teamName: string;
      value: number | string;
      details?: string;
    }>;
  }