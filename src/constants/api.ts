// API endpoints
export const API_ENDPOINTS = {
  USER: '/api/user',
  LEAGUES_JOIN: '/api/leagues/join',
  SLEEPER_TEAMS: (leagueId: string) => `/api/sleeper/leagues/${leagueId}/teams`,
} as const;

// Sleeper API constants
export const SLEEPER_API = {
  BASE_URL: 'https://api.sleeper.app/v1',
  LEAGUE: (leagueId: string) => `https://api.sleeper.app/v1/league/${leagueId}`,
  ROSTERS: (leagueId: string) => `https://api.sleeper.app/v1/league/${leagueId}/rosters`,
  USERS: (leagueId: string) => `https://api.sleeper.app/v1/league/${leagueId}/users`,
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;