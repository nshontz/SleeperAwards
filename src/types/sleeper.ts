export interface SleeperLeague {
    league_id: string;
    name: string;
    total_rosters: number;
    status: string;
    season: string;
    scoring_settings: Record<string, number>;
    roster_positions: string[];
    settings?: {
      divisions?: number;
      playoff_teams?: number;
      playoff_type?: number;
    };
    metadata?: {
      division_1?: string;
      division_2?: string;
      division_3?: string;
      division_4?: string;
    };
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
      division?: number;
    };
    metadata?: {
      division?: string;
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
  
  export interface SleeperPlayer {
    player_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    position: string;
    team: string;
    status: string;
    fantasy_positions: string[];
    injury_status?: string;
    years_exp?: number;
    height?: string;
    weight?: string;
    age?: number;
  }

  export interface TrendingPlayer {
    player_id: string;
    count: number;
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