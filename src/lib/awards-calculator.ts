import { SleeperRoster, SleeperUser, SleeperMatchup, Award } from '@/types/sleeper';
import awardsConfig from '@/data/awards.json';

export class AwardsCalculator {
  private rosters: SleeperRoster[];
  private users: SleeperUser[];
  private allMatchups: SleeperMatchup[][];
  private teamNames: Map<number, string>;

  constructor(rosters: SleeperRoster[], users: SleeperUser[], allMatchups: SleeperMatchup[][]) {
    this.rosters = rosters;
    this.users = users;
    this.allMatchups = allMatchups;
    this.teamNames = this.createTeamNameMap();
  }

  private createTeamNameMap(): Map<number, string> {
    const map = new Map<number, string>();
    
    this.rosters.forEach(roster => {
      const user = this.users.find(u => u.user_id === roster.owner_id);
      const teamName = user?.metadata?.team_name || user?.display_name || `Team ${roster.roster_id}`;
      map.set(roster.roster_id, teamName);
    });
    
    return map;
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const validValues = values.filter(v => !isNaN(v) && isFinite(v));
    if (validValues.length === 0) return 0;
    const mean = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
    const variance = validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validValues.length;
    const result = Math.sqrt(variance);
    return isNaN(result) || !isFinite(result) ? 0 : result;
  }

  calculateAllAwards(): Award[] {
    return [
      this.calculateFewestPointsAgainst(),
      this.calculateMostPointsAgainst(),
      this.calculateMostPredictable(),
      this.calculateMostConsistent(),
      this.calculateBoomOrBustPlayer(),
      this.calculateBoomOrBustTeam(),
      this.calculateBestSingleGame(),
      this.calculateBestGameAboveProjections(),
      this.calculateBiggestBlowout(),
      this.calculateBenchOutscoredStarters(),
      this.calculateStartersOutplayedBench(),
      this.calculateHighestScoringLoss(),
      this.calculateMostInjuries()
    ];
  }

  private calculateFewestPointsAgainst(): Award {
    const leaderboard = this.rosters
      .map(roster => {
        const fpts = roster.settings.fpts_against || 0;
        const fptsDecimal = roster.settings.fpts_against_decimal || 0;
        const totalPoints = fpts + (fptsDecimal / 100);
        const value = isNaN(totalPoints) || !isFinite(totalPoints) ? 0 : totalPoints;
        return {
          rank: 0,
          teamName: this.teamNames.get(roster.roster_id) || 'Unknown Team',
          value: Number(value.toFixed(2)),
          details: `${value.toFixed(2)} points against`
        };
      })
      .sort((a, b) => Number(a.value) - Number(b.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.fewestPointsAgainst.id,
      name: awardsConfig.fewestPointsAgainst.name,
      description: awardsConfig.fewestPointsAgainst.description,
      icon: awardsConfig.fewestPointsAgainst.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }

  private calculateMostPointsAgainst(): Award {
    const leaderboard = this.rosters
      .map(roster => {
        const fpts = roster.settings.fpts_against || 0;
        const fptsDecimal = roster.settings.fpts_against_decimal || 0;
        const totalPoints = fpts + (fptsDecimal / 100);
        const value = isNaN(totalPoints) || !isFinite(totalPoints) ? 0 : totalPoints;
        return {
          rank: 0,
          teamName: this.teamNames.get(roster.roster_id) || 'Unknown Team',
          value: Number(value.toFixed(2)),
          details: `${value.toFixed(2)} points against`
        };
      })
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.mostPointsAgainst.id,
      name: awardsConfig.mostPointsAgainst.name,
      description: awardsConfig.mostPointsAgainst.description,
      icon: awardsConfig.mostPointsAgainst.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }

  private calculateMostPredictable(): Award {
    // This would require projection data - placeholder for now
    const leaderboard = this.rosters
      .map(roster => ({
        rank: 0,
        teamName: this.teamNames.get(roster.roster_id) || '',
        value: Number((Math.random() * 100).toFixed(1)), // Placeholder - would calculate actual vs projected
        details: 'Projection accuracy score'
      }))
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.mostPredictable.id,
      name: awardsConfig.mostPredictable.name,
      description: awardsConfig.mostPredictable.description,
      icon: awardsConfig.mostPredictable.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }

  private calculateMostConsistent(): Award {
    const teamWeeklyScores = new Map<number, number[]>();
    
    this.allMatchups.forEach(weekMatchups => {
      weekMatchups.forEach(matchup => {
        if (!teamWeeklyScores.has(matchup.roster_id)) {
          teamWeeklyScores.set(matchup.roster_id, []);
        }
        teamWeeklyScores.get(matchup.roster_id)?.push(matchup.points);
      });
    });

    const leaderboard = Array.from(teamWeeklyScores.entries())
      .filter(([_, scores]) => scores.length > 0)
      .map(([rosterId, scores]) => ({
        rank: 0,
        teamName: this.teamNames.get(rosterId) || '',
        value: Number(this.calculateStandardDeviation(scores).toFixed(2)),
        details: `StdDev: ${this.calculateStandardDeviation(scores).toFixed(2)}`
      }))
      .sort((a, b) => Number(a.value) - Number(b.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.mostConsistent.id,
      name: awardsConfig.mostConsistent.name,
      description: awardsConfig.mostConsistent.description,
      icon: awardsConfig.mostConsistent.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }

  private calculateBoomOrBustPlayer(): Award {
    // Placeholder for boom/bust player calculation
    const leaderboard = this.rosters
      .map(roster => ({
        rank: 0,
        teamName: this.teamNames.get(roster.roster_id) || '',
        value: Number((Math.random() * 100).toFixed(1)),
        details: 'Player variance score'
      }))
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.boomOrBustPlayer.id,
      name: awardsConfig.boomOrBustPlayer.name,
      description: awardsConfig.boomOrBustPlayer.description,
      icon: awardsConfig.boomOrBustPlayer.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }

  private calculateBoomOrBustTeam(): Award {
    const teamWeeklyScores = new Map<number, number[]>();
    
    this.allMatchups.forEach(weekMatchups => {
      weekMatchups.forEach(matchup => {
        if (!teamWeeklyScores.has(matchup.roster_id)) {
          teamWeeklyScores.set(matchup.roster_id, []);
        }
        teamWeeklyScores.get(matchup.roster_id)?.push(matchup.points);
      });
    });

    const leaderboard = Array.from(teamWeeklyScores.entries())
      .filter(([_, scores]) => scores.length > 0)
      .map(([rosterId, scores]) => ({
        rank: 0,
        teamName: this.teamNames.get(rosterId) || '',
        value: Number(this.calculateStandardDeviation(scores).toFixed(2)),
        details: `StdDev: ${this.calculateStandardDeviation(scores).toFixed(2)}`
      }))
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.boomOrBustTeam.id,
      name: awardsConfig.boomOrBustTeam.name,
      description: awardsConfig.boomOrBustTeam.description,
      icon: awardsConfig.boomOrBustTeam.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }

  private calculateBestSingleGame(): Award {
    let bestGame = { rosterId: 0, points: 0, week: 0 };
    
    this.allMatchups.forEach((weekMatchups, weekIndex) => {
      weekMatchups.forEach(matchup => {
        const points = matchup.points || 0;
        if (points > bestGame.points) {
          bestGame = {
            rosterId: matchup.roster_id,
            points,
            week: weekIndex + 1
          };
        }
      });
    });

    const leaderboard = this.rosters
      .map(roster => {
        let maxScore = 0;
        let maxWeek = 0;
        this.allMatchups.forEach((weekMatchups, weekIndex) => {
          const teamMatchup = weekMatchups.find(m => m.roster_id === roster.roster_id);
          if (teamMatchup) {
            const points = teamMatchup.points || 0;
            if (points > maxScore) {
              maxScore = points;
              maxWeek = weekIndex + 1;
            }
          }
        });
        
        const value = isNaN(maxScore) || !isFinite(maxScore) ? 0 : maxScore;
        return {
          rank: 0,
          teamName: this.teamNames.get(roster.roster_id) || 'Unknown Team',
          value: Number(value.toFixed(2)),
          details: maxWeek > 0 ? `${value.toFixed(2)} points in Week ${maxWeek}` : 'No data available'
        };
      })
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.bestSingleGame.id,
      name: awardsConfig.bestSingleGame.name,
      description: awardsConfig.bestSingleGame.description,
      icon: awardsConfig.bestSingleGame.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }

  private calculateBestGameAboveProjections(): Award {
    // Placeholder for "best game above projections"
    const leaderboard = this.rosters
      .map(roster => ({
        rank: 0,
        teamName: this.teamNames.get(roster.roster_id) || '',
        value: Number((Math.random() * 50).toFixed(1)),
        details: 'Points above projection'
      }))
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.bestGameAboveProjections.id,
      name: awardsConfig.bestGameAboveProjections.name,
      description: awardsConfig.bestGameAboveProjections.description,
      icon: awardsConfig.bestGameAboveProjections.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }

  private calculateBiggestBlowout(): Award {
    let biggestBlowout = { winner: 0, loser: 0, margin: 0, week: 0 };
    
    this.allMatchups.forEach((weekMatchups, weekIndex) => {
      const matchupMap = new Map<number, SleeperMatchup[]>();
      
      weekMatchups.forEach(matchup => {
        if (!matchupMap.has(matchup.matchup_id)) {
          matchupMap.set(matchup.matchup_id, []);
        }
        matchupMap.get(matchup.matchup_id)?.push(matchup);
      });
      
      matchupMap.forEach(teams => {
        if (teams.length === 2) {
          const [team1, team2] = teams;
          const margin = Math.abs(team1.points - team2.points);
          if (margin > biggestBlowout.margin) {
            biggestBlowout = {
              winner: team1.points > team2.points ? team1.roster_id : team2.roster_id,
              loser: team1.points < team2.points ? team1.roster_id : team2.roster_id,
              margin,
              week: weekIndex + 1
            };
          }
        }
      });
    });

    const leaderboard = this.rosters
      .map(roster => {
        let maxBlowout = 0;
        let maxWeek = 0;
        
        this.allMatchups.forEach((weekMatchups, weekIndex) => {
          const matchupMap = new Map<number, SleeperMatchup[]>();
          
          weekMatchups.forEach(matchup => {
            if (!matchupMap.has(matchup.matchup_id)) {
              matchupMap.set(matchup.matchup_id, []);
            }
            matchupMap.get(matchup.matchup_id)?.push(matchup);
          });
          
          matchupMap.forEach(teams => {
            if (teams.length === 2) {
              const teamMatchup = teams.find(t => t.roster_id === roster.roster_id);
              const opponentMatchup = teams.find(t => t.roster_id !== roster.roster_id);
              
              if (teamMatchup && opponentMatchup && teamMatchup.points > opponentMatchup.points) {
                const margin = teamMatchup.points - opponentMatchup.points;
                if (margin > maxBlowout) {
                  maxBlowout = margin;
                  maxWeek = weekIndex + 1;
                }
              }
            }
          });
        });
        
        const value = isNaN(maxBlowout) || !isFinite(maxBlowout) ? 0 : maxBlowout;
        return {
          rank: 0,
          teamName: this.teamNames.get(roster.roster_id) || 'Unknown Team',
          value: Number(value.toFixed(2)),
          details: maxWeek > 0 ? `${value.toFixed(2)} point margin in Week ${maxWeek}` : 'No data available'
        };
      })
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.biggestBlowout.id,
      name: awardsConfig.biggestBlowout.name,
      description: awardsConfig.biggestBlowout.description,
      icon: awardsConfig.biggestBlowout.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }

  private calculateBenchOutscoredStarters(): Award {
    // Placeholder for bench outscoring starters
    const leaderboard = this.rosters
      .map(roster => ({
        rank: 0,
        teamName: this.teamNames.get(roster.roster_id) || '',
        value: Number((Math.random() * 100).toFixed(1)),
        details: 'Bench advantage points'
      }))
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.benchOutscoredStarters.id,
      name: awardsConfig.benchOutscoredStarters.name,
      description: awardsConfig.benchOutscoredStarters.description,
      icon: awardsConfig.benchOutscoredStarters.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }

  private calculateStartersOutplayedBench(): Award {
    // Placeholder for starters outperforming bench
    const leaderboard = this.rosters
      .map(roster => ({
        rank: 0,
        teamName: this.teamNames.get(roster.roster_id) || '',
        value: Number((Math.random() * 100).toFixed(1)),
        details: 'Starter advantage points'
      }))
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.startersOutplayedBench.id,
      name: awardsConfig.startersOutplayedBench.name,
      description: awardsConfig.startersOutplayedBench.description,
      icon: awardsConfig.startersOutplayedBench.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }

  private calculateHighestScoringLoss(): Award {
    // Placeholder for highest scoring loss
    const leaderboard = this.rosters
      .map(roster => ({
        rank: 0,
        teamName: this.teamNames.get(roster.roster_id) || '',
        value: Number((Math.random() * 150).toFixed(1)),
        details: 'Highest losing score'
      }))
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.highestScoringLoss.id,
      name: awardsConfig.highestScoringLoss.name,
      description: awardsConfig.highestScoringLoss.description,
      icon: awardsConfig.highestScoringLoss.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }

  private calculateMostInjuries(): Award {
    // Placeholder for most injuries
    const leaderboard = this.rosters
      .map(roster => ({
        rank: 0,
        teamName: this.teamNames.get(roster.roster_id) || '',
        value: Math.floor(Math.random() * 10),
        details: 'Injured players in a week'
      }))
      .sort((a, b) => Number(b.value) - Number(a.value))
      .map((team, index) => ({ ...team, rank: index + 1 }));

    return {
      id: awardsConfig.mostInjuries.id,
      name: awardsConfig.mostInjuries.name,
      description: awardsConfig.mostInjuries.description,
      icon: awardsConfig.mostInjuries.icon,
      winner: leaderboard.length > 0 ? leaderboard[0] : undefined,
      leaderboard
    };
  }
}