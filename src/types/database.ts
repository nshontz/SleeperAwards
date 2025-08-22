// Base interfaces matching Prisma models exactly

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id?: string | null;
  name: string;
  sleeperRosterId: string | null;
  ownerId: string;
  leagueId: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface League {
  id: string;
  name: string;
  description: string | null;
  sleeperLeagueId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces with relationships

export interface UserWithTeams extends User {
  teams: Team[];
}

export interface UserWithTeamsAndLeagues extends User {
  teams: TeamWithLeague[];
}

export interface TeamWithOwner extends Team {
  owner: User;
}

export interface TeamWithLeague extends Team {
  league: League;
}

export interface TeamWithOwnerAndLeague extends Team {
  owner: User;
  league: League;
}

export interface LeagueWithTeams extends League {
  teams: Team[];
}

export interface LeagueWithTeamsAndOwners extends League {
  teams: TeamWithOwner[];
}

// Input/Creation interfaces (omit auto-generated fields)

export interface CreateUserInput {
  email: string;
  name?: string | null;
}

export interface UpdateUserInput {
  email?: string;
  name?: string | null;
}

export interface CreateTeamInput {
  name: string;
  sleeperRosterId?: string | null;
  ownerId: string;
  leagueId: string;
}

export interface UpdateTeamInput {
  name?: string;
  sleeperRosterId?: string | null;
  ownerId?: string;
  leagueId?: string;
}

export interface CreateLeagueInput {
  name: string;
  description?: string | null;
  sleeperLeagueId: string;
}

export interface UpdateLeagueInput {
  name?: string;
  description?: string | null;
  sleeperLeagueId?: string;
}

// Utility types for common queries

export type UserSelect = {
  id?: boolean;
  email?: boolean;
  name?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  teams?: boolean | TeamSelect;
};

export type TeamSelect = {
  id?: boolean;
  name?: boolean;
  sleeperRosterId?: boolean;
  ownerId?: boolean;
  leagueId?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  owner?: boolean | UserSelect;
  league?: boolean | LeagueSelect;
};

export type LeagueSelect = {
  id?: boolean;
  name?: boolean;
  description?: boolean;
  sleeperLeagueId?: boolean;
  createdAt?: boolean;
  updatedAt?: boolean;
  teams?: boolean | TeamSelect;
};

// Common filter types

export interface UserFilters {
  id?: string;
  email?: string;
  name?: string | null;
}

export interface TeamFilters {
  id?: string;
  name?: string;
  sleeperRosterId?: string | null;
  ownerId?: string;
  leagueId?: string;
}

export interface LeagueFilters {
  id?: string;
  name?: string;
  sleeperLeagueId?: string;
  description?: string | null;
}

// API response types

export interface UserResponse {
  user: UserWithTeamsAndLeagues;
}

export interface UsersResponse {
  users: UserWithTeams[];
  count: number;
}

export interface TeamResponse {
  team: TeamWithOwnerAndLeague;
}

export interface TeamsResponse {
  teams: TeamWithOwnerAndLeague[];
  count: number;
}

export interface LeagueResponse {
  league: LeagueWithTeamsAndOwners;
}

export interface LeaguesResponse {
  leagues: LeagueWithTeams[];
  count: number;
}