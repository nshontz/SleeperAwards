import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Create default league
  const defaultLeague = await prisma.league.upsert({
    where: { sleeperLeagueId: '1262129908398694400' },
    update: {},
    create: {
      name: 'Bine to Shrine Fantasy League',
      description: 'Default Sleeper league',
      sleeperLeagueId: '1262129908398694400',
    },
  });

  // Create sample users with teams
  const users = [
    { email: 'user1@example.com', name: 'Team Owner 1', teamName: 'Team Alpha', sleeperRosterId: '1' },
    { email: 'user2@example.com', name: 'Team Owner 2', teamName: 'Team Beta', sleeperRosterId: '2' },
    { email: 'user3@example.com', name: 'Team Owner 3', teamName: 'Team Gamma', sleeperRosterId: '3' },
    { email: 'admin@example.com', name: 'League Admin', teamName: 'Admin Team', sleeperRosterId: '4'},
  ];

  for (const userData of users) {
    // Create user
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
      },
    });

    // Create team for user
    await prisma.team.upsert({
      where: { 
        ownerId_leagueId: {
          ownerId: user.id,
          leagueId: defaultLeague.id,
        }
      },
      update: {},
      create: {
        name: userData.teamName,
        sleeperRosterId: userData.sleeperRosterId,
        ownerId: user.id,
        leagueId: defaultLeague.id,
      },
    });

    console.log(`Created user ${userData.email} with team ${userData.teamName}`);
  }

  console.log('Seed data created successfully');
  console.log(`Default league: ${defaultLeague.name} (${defaultLeague.sleeperLeagueId})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });