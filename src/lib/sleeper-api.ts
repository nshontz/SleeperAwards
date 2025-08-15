import { SleeperLeague, SleeperRoster, SleeperUser, SleeperMatchup } from '@/types/sleeper';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export class SleeperAPI {
  private leagueId: string;

  constructor(leagueId: string) {
    this.leagueId = leagueId;
  }

  async getLeague(): Promise<SleeperLeague> {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}`);
    if (!response.ok) throw new Error('Failed to fetch league');
    return response.json();
  }

  async getRosters(): Promise<SleeperRoster[]> {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}/rosters`);
    if (!response.ok) throw new Error('Failed to fetch rosters');
    return response.json();
  }

  async getUsers(): Promise<SleeperUser[]> {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }

  async getMatchups(week: number): Promise<SleeperMatchup[]> {
    const response = await fetch(`${SLEEPER_BASE_URL}/league/${this.leagueId}/matchups/${week}`);
    if (!response.ok) throw new Error(`Failed to fetch matchups for week ${week}`);
    return response.json();
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
}
