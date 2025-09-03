import { SleeperLeague, SleeperRoster, SleeperUser, SleeperMatchup } from '@/types/sleeper';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export class SleeperAPI {
  private leagueId: string;

  constructor(leagueId: string) {
    this.leagueId = leagueId;
  }

  async getLeague(): Promise<SleeperLeague> {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}`);
    if (!response.ok) throw new Error(`Failed to fetch league: ${response.status}`);
    
    const text = await response.text();
    if (text.startsWith('<!DOCTYPE')) {
      throw new Error('Received HTML instead of JSON - API may be down');
    }
    
    return JSON.parse(text);
  }

  async getRosters(): Promise<SleeperRoster[]> {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}/rosters`);
    if (!response.ok) throw new Error(`Failed to fetch rosters: ${response.status}`);
    
    const text = await response.text();
    if (text.startsWith('<!DOCTYPE')) {
      throw new Error('Received HTML instead of JSON - API may be down');
    }
    
    return JSON.parse(text);
  }

  async getUsers(): Promise<SleeperUser[]> {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}/users`);
    if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
    
    const text = await response.text();
    if (text.startsWith('<!DOCTYPE')) {
      throw new Error('Received HTML instead of JSON - API may be down');
    }
    
    return JSON.parse(text);
  }

  async getMatchups(week: number): Promise<SleeperMatchup[]> {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}/matchups/${week}`);
    if (!response.ok) throw new Error(`Failed to fetch matchups for week ${week}: ${response.status}`);
    
    const text = await response.text();
    if (text.startsWith('<!DOCTYPE')) {
      throw new Error('Received HTML instead of JSON - API may be down');
    }
    
    return JSON.parse(text);
  }

  async getAllMatchups(totalWeeks: number = 17): Promise<SleeperMatchup[][]> {
    const matchupsPromises = Array.from({ length: totalWeeks }, (_, i) => 
      this.getMatchups(i + 1).catch(() => [])
    );
    return Promise.all(matchupsPromises);
  }

  async getNFLState() {
    const response = await fetch(`${SLEEPER_BASE_URL}/state/nfl`);
    if (!response.ok) throw new Error('Failed to fetch NFL state');
    return response.json();
  }

  async getAllPlayers() {
    const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl`);
    if (!response.ok) throw new Error(`Failed to fetch players: ${response.status}`);
    
    const text = await response.text();
    if (text.startsWith('<!DOCTYPE')) {
      throw new Error('Received HTML instead of JSON - API may be down');
    }
    
    return JSON.parse(text);
  }

  async getTrendingPlayers(type: 'add' | 'drop' = 'add', hours: number = 24) {
    const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl/trending/${type}?lookback_hours=${hours}&limit=25`);
    if (!response.ok) throw new Error(`Failed to fetch trending players: ${response.status}`);
    
    const text = await response.text();
    if (text.startsWith('<!DOCTYPE')) {
      throw new Error('Received HTML instead of JSON - API may be down');
    }
    
    return JSON.parse(text);
  }

  async getProjections(season: string, week: number) {
    const response = await fetch(`${SLEEPER_BASE_URL}/projections/nfl/${season}/${week}`);
    if (!response.ok) throw new Error(`Failed to fetch projections: ${response.status}`);
    
    const text = await response.text();

    console.log(text, week, season);
    if (text.startsWith('<!DOCTYPE')) {
      throw new Error('Received HTML instead of JSON - API may be down');
    }
    
    return JSON.parse(text);
  }
}
