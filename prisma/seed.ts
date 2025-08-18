import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Create default user
  const defaultUser = await prisma.user.upsert({
    where: { email: 'default@example.com' },
    update: {},
    create: {
      email: 'default@example.com',
      name: 'Default User',
      isDefault: true,
    },
  });

  // Create default league with the LEAGUE_ID from .env.local
  const defaultLeague = await prisma.league.upsert({
    where: { sleeperLeagueId: '1262129908398694400' },
    update: {},
    create: {
      name: 'Default League',
      description: 'Default Sleeper league',
      sleeperLeagueId: '1262129908398694400',
      isDefault: true,
    },
  });

  // Associate default user with default league
  await prisma.userLeague.upsert({
    where: { 
      userId_leagueId: {
        userId: defaultUser.id,
        leagueId: defaultLeague.id,
      }
    },
    update: {},
    create: {
      userId: defaultUser.id,
      leagueId: defaultLeague.id,
      role: 'owner',
    },
  });

  console.log('Seed data created successfully');
  console.log(`Default user: ${defaultUser.email}`);
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