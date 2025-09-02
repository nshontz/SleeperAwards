import { PrismaClient } from '../../src/generated/prisma';
import { Team} from '../../src/types/database';

const prisma = new PrismaClient();

export async function seedTeams() {
  console.log('🏈 Seeding teams...');

  // Get the user first
  const user = await prisma.user.findUnique({
    where: { email: 'nickshontz@gmail.com' },
  });

  if (!user) {
    throw new Error('User nickshontz@gmail.com not found. Please run user seeder first.');
  }

  // Get leagues by their Sleeper IDs
  const bineLeague = await prisma.league.findUnique({
    where: { sleeperLeagueId: '1262129908398694400' },
  });

  const sandboxLeague = await prisma.league.findUnique({
    where: { sleeperLeagueId: '1263887047232331776' },
  });

  // Validate that both leagues exist
  if (!bineLeague || !sandboxLeague) {
    throw new Error('leagues not found. Please run league seeder first.');
  }

  const teams: Team[] = [
    {
      name: 'Bine',
      sleeperRosterId: '1',
      ownerId: '1',
      leagueId: bineLeague.id,
    },
    {
      name: 'SandBox',
      ownerId: '1',
      sleeperRosterId: '1',
      leagueId: sandboxLeague.id,
    },
  ];

  const createdTeams = [];

  for (const teamData of teams) {
    if (!teamData.leagueId) {
      console.warn(`⚠️ Skipping team ${teamData.name} - league not found`);
      continue;
    }

    const team = await prisma.team.upsert({
      where: {
        ownerId_leagueId: {
          ownerId: user.id,
          leagueId: teamData.leagueId,
        },
      },
      update: {
        name: teamData.name,
        sleeperRosterId: teamData.sleeperRosterId,
      },
      create: {
        name: teamData.name,
        sleeperRosterId: teamData.sleeperRosterId,
        ownerId: user.id,
        leagueId: teamData.leagueId,
      },
      include: {
        league: true,
      },
    });

    createdTeams.push(team);
    console.log(`✅ Created/Updated team: ${team.name} (Roster: ${team.sleeperRosterId}) in ${team.league.name}`);
  }

  console.log(`🎉 Successfully seeded ${createdTeams.length} teams\n`);
  return createdTeams;
}

// Allow running this seeder individually
if (require.main === module) {
  seedTeams()
    .catch((e) => {
      console.error('❌ Error seeding teams:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}