export async function getDefaultUserAndLeague() {
  const response = await fetch('/api/default-user');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch default user and league');
  }
  return await response.json();
}

export async function getDefaultSleeperLeagueId(): Promise<string> {
  const response = await fetch('/api/default-league');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch default league');
  }
  const data = await response.json();
  return data.sleeperLeagueId;
}