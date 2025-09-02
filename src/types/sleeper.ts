// Comprehensive Sleeper League interface covering all API use cases
export interface SleeperLeague {
  league_id: string;
  name: string;
  total_rosters: number;
  status: string;
  season: string;
  season_type: string;
  scoring_settings: Record<string, number>;
  roster_positions: string[];
  draft_id?: string;
  avatar?: string;
  previous_league_id?: string;
  settings?: {
    divisions?: number;
    playoff_teams?: number;
    playoff_type?: number;
    max_keepers?: number;
    trade_deadline?: number;
    playoff_week_start?: number;
    start_week?: number;
    playoff_round_type?: number;
    daily_waivers_hour?: number;
  };
  metadata?: {
    division_1?: string;
    division_2?: string;
    division_3?: string;
    division_4?: string;
    division_1_avatar?: string;
    division_2_avatar?: string;
  };
}

// Simplified version for UI components
export interface SleeperLeagueSimple {
  id: string;
  name: string;
  season: string;
  totalTeams: number;
  status: string;
}
  
// Comprehensive Sleeper Roster interface covering all API use cases
export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[];
  starters: string[];
  reserve?: string[];
  taxi?: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_against: number;
    fpts_decimal: number;
    fpts_against_decimal: number;
    division?: number;
    waiver_position?: number;
    waiver_budget_used?: number;
    total_moves?: number;
  };
  metadata?: {
    division?: string;
  };
}

// Comprehensive Sleeper User interface covering all API use cases  
export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar?: string | null;
  metadata?: {
    team_name?: string;
    mention_pn?: string;
    allow_pn?: string;
    trade_block_pn?: string;
    mascot_message?: string;
    show_mascots?: string;
  };
}

// UI-friendly team interface for components
export interface SleeperTeam {
  rosterId: number;
  ownerId: string;
  teamName: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  wins: number;
  losses: number;
  ties: number;
  points: string;
  pointsAgainst: string;
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